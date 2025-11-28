// src/routes/createEventRouter.js
import { Router } from 'express';
import Event from '../models/eventsModel.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import logError from '../../logError.js';
import Member from '../models/memberModel.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import nodemailer from 'nodemailer'; // optional - kept for compatibility

const createEventRouter = Router();
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Helper to escape HTML for text -> html safe insertion
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Build simple email content (html + text) for the event
 */
function buildEmailContent(event) {
  const title = event.eventName || 'SKK Event';
  const desc = event.eventDescription || '';
  const location = event.location || 'TBA';
  const start = event.startDateTime ? new Date(event.startDateTime) : null;
  const end = event.endDateTime ? new Date(event.endDateTime) : null;
  const opts = { year: 'numeric', month: 'long', day: 'numeric' };
  const timeOpts = { hour: 'numeric', minute: '2-digit' };
  const dateStr = start ? start.toLocaleDateString(undefined, opts) : '';
  const startStr = start ? start.toLocaleTimeString([], timeOpts) : '';
  const endStr = end ? end.toLocaleTimeString([], timeOpts) : '';

  const subject = `📣 Invitation: ${title}${dateStr ? ' — ' + dateStr : ''}`;

  // plaintext
  const textParts = [
    `You're invited to: ${title}`,
    '',
    desc,
    '',
    `Location: ${location}`,
    start ? `Date: ${dateStr}` : '',
    start ? `Time: ${startStr}${endStr ? ' — ' + endStr : ''}` : '',
    '',
    `View event: ${process.env.SITE_ORIGIN || 'http://localhost:3000'}/events/${event._id}`,
    '',
    'See you there! 🙏',
  ].filter(Boolean);
  const text = textParts.join('\n');

  // html - simple modern formatted template
  const logoUrl =
    (process.env.SITE_ORIGIN || '').replace(/\/$/, '') + '/public/assets/SKK_Logo.png';
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f6f8; padding:20px;">
    <div style="max-width:680px; margin:0 auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 6px 24px rgba(15,23,42,0.06);">
      <div style="background:linear-gradient(90deg,#1f8a31,#5dbb63); color:#fff; padding:16px 20px; display:flex; align-items:center; gap:12px;">
        <img src="${logoUrl}" width="44" height="44" alt="SKK" style="border-radius:6px; object-fit:cover;">
        <div style="font-weight:700; font-size:16px;">Simpleng Kristiyanong Komunidad</div>
        <div style="margin-left:auto; opacity:0.95;">${escapeHtml(dateStr)}</div>
      </div>

      <div style="padding:20px;">
        <h2 style="margin:0 0 8px;">📣 ${escapeHtml(title)}</h2>
        <p style="color:#374151; line-height:1.45; margin:0 0 12px;">${escapeHtml(desc).replace(/\n/g, '<br>')}</p>

        <div style="display:flex; gap:12px; margin-top:12px; flex-wrap:wrap;">
          <div style="flex:1; min-width:200px; background:#f7fafb; padding:12px; border-radius:8px; border:1px solid #eef2f7;">
            <strong style="display:block; margin-bottom:6px;">📍 Location</strong>
            <div>${escapeHtml(location)}</div>
          </div>
          <div style="min-width:200px; background:#f7fafb; padding:12px; border-radius:8px; border:1px solid #eef2f7;">
            <strong style="display:block; margin-bottom:6px;">⏰ Time</strong>
            <div>${escapeHtml(startStr)}${endStr ? ' — ' + escapeHtml(endStr) : ''}</div>
            <div style="color:#6b7280; font-size:12px; margin-top:6px;">${escapeHtml(dateStr)}</div>
          </div>
        </div>

        <div style="text-align:center; margin-top:18px;">
          <a href="https://skk.up.railway.app" style="display:inline-block; padding:12px 18px; border-radius:8px; background:linear-gradient(90deg,#1f8a31,#5dbb63); color:#fff; text-decoration:none; font-weight:600;">
            ✅ View Event Details
          </a>
        </div>

        <p style="color:#6b7280; font-size:13px; margin-top:18px;">If you have questions, reply to this email or contact the organizer.</p>
      </div>

      <div style="padding:12px 20px; background:#fbfdfb; border-top:1px solid #eef2f7; font-size:12px; color:#6b7280;">
        <div style="display:flex; justify-content:space-between; gap:12px;">
          <div>🙏 <strong>SKK</strong> — Simpleng Kristiyanong Komunidad</div>
          <div>Made with ❤️</div>
        </div>
      </div>
    </div>
  </div>
  `;

  return { subject, text, html };
}

/**
 * Small sleep helper for batch delay
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * GET /createEvent
 * Render create event page and pass members for "Custom" list
 */
createEventRouter.get('/createEvent', requireAdmin, async (req, res) => {
  try {
    // fetch members to populate the "Custom" dropdown
    const members = await Member.find({}).sort({ fullName: 1 }).lean();

    // render template (assumes view is src/views/createEvent.hbs)
    return res.render('createEvent', {
      members,
      user: req.user || null,
    });
  } catch (err) {
    console.error('Error fetching members for createEvent', err);
    await logError(err, req);
    return res.status(500).send('Server error');
  }
});

/**
 * POST /createEvent
 * Create a new event and send notification emails directly via SMTP (no queue).
 */
createEventRouter.post('/createEvent', requireAdmin, async (req, res) => {
  try {
    // Parse form fields (adjust names depending on client form)
    const {
      eventName,
      eventDescription,
      eventLocation,
      eventType,
      startDateTime,
      endDateTime,
      expectedAttendees,
      sendAll,
      customMembers, // can be: undefined | single string | array of strings | JSON string (from hidden input)
    } = req.body || {};

    // Basic validation
    if (!eventName) {
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(400).json({ status: false, message: 'Event name is required' });
      }
      return res.redirect('/?error=1&msg=' + encodeURIComponent('Event name is required'));
    }

    const start = startDateTime ? new Date(startDateTime) : null;
    const end = endDateTime ? new Date(endDateTime) : null;
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(400).json({ status: false, message: 'Invalid start or end date' });
      }
      return res.redirect('/?error=1&msg=' + encodeURIComponent('Invalid start or end date'));
    }

    // Build event object; make sure type has a default to avoid schema validation issues
    const newEvent = new Event({
      eventName: eventName,
      eventDescription: eventDescription || '',
      location: eventLocation || '',
      type: eventType || 'Other',
      startDateTime: start,
      endDateTime: end,
      expectedAttendees: expectedAttendees ? Number(expectedAttendees) : 0,
      status: 'upcoming',
      createdBy: req.user ? req.user._id : null,
    });

    await newEvent.save();

    // Determine recipients depending on sendAll or customMembers
    // Determine recipients depending on sendAll or customMembers
    let recipients = [];
    try {
      if (sendAll === 'on' || sendAll === true || sendAll === 'true') {
        // send to all members with an emailAddress (use correct field name)
        const allMembers = await Member.find({ emailAddress: { $exists: true, $ne: '' } }).lean();
        // map to the field your model uses
        recipients = allMembers.map((m) => m.emailAddress).filter(Boolean);
      } else if (customMembers) {
        // Normalize customMembers into an array
        let arr = [];
        if (typeof customMembers === 'string') {
          // could be a JSON string (e.g. "[]") or a single id/name string
          const trimmed = customMembers.trim();
          if (
            (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
            (trimmed.startsWith('"') && trimmed.endsWith('"'))
          ) {
            try {
              arr = JSON.parse(trimmed);
            } catch {
              // fallback: treat as single item
              arr = [trimmed];
            }
          } else {
            arr = [trimmed];
          }
        } else if (Array.isArray(customMembers)) {
          arr = customMembers;
        }

        // remove falsy
        arr = arr.filter(Boolean);

        // If empty after normalization -> no recipients
        if (arr.length > 0) {
          // Detect whether array items look like Mongo ObjectIds (24 hex chars)
          const looksLikeObjectId = (val) =>
            typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

          if (arr.every(looksLikeObjectId)) {
            // treat as member ids
            const ids = arr;
            const selected = await Member.find({ _id: { $in: ids } }).lean();
            // your model uses `emailAddress`
            recipients = selected.map((m) => m.emailAddress).filter(Boolean);
          } else {
            // treat as SIM names (e.g. ["Kids","Youth","YoAds","WOW","DIG"])
            const sims = arr;
            // your model uses `sim` and `emailAddress`
            const selected = await Member.find({
              sim: { $in: sims },
              emailAddress: { $exists: true, $ne: '' },
            }).lean();
            recipients = selected.map((m) => m.emailAddress).filter(Boolean);
          }
        }
      }
    } catch (memberErr) {
      // If fetching recipients fails, log but don't crash the event creation
      console.error('Failed to resolve recipients', memberErr);
      await logError(memberErr, req);
    }
    // Debug logging: show resolved recipients info (helps confirm what's being used)
    console.log(`Resolved recipients count: ${recipients.length}`);
    if (recipients.length) {
      // show up to 50 recipients for sanity-check
      console.log('Sample recipients:', recipients.slice(0, 50));
    } else {
      console.log('No recipients resolved (recipients array empty).');
    }

    // If EMAIL host configured, send notifications via SMTP. Otherwise, log recipients (dev mode).
    const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || null;
    if (smtpHost && recipients.length > 0) {
      // create transporter (Gmail App Passwords supported)
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587),
        secure: String(process.env.SMTP_SECURE || process.env.EMAIL_SECURE || 'false') === 'true',
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USER,
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
        },
      });

      // verify transporter (log but don't fail the route if verify fails)
      try {
        await transporter.verify();
        console.log('SMTP verified');
      } catch (vErr) {
        console.error('SMTP verify failed', vErr);
        await logError(vErr, req);
      }

      // Build email body once
      const { subject, text, html } = buildEmailContent(newEvent);

      // Batch sending using BCC to avoid exposing recipients
      const batchSize = Number(process.env.EMAIL_BATCH_SIZE || 50);
      const batchDelayMs = Number(process.env.EMAIL_BATCH_DELAY_MS || 400);

      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const message = {
          from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
          bcc: batch,
          subject,
          text,
          html,
        };

        try {
          const info = await transporter.sendMail(message);
          console.log(
            `Sent batch ${Math.floor(i / batchSize) + 1}: ${info.messageId} (recipients: ${batch.length})`
          );
        } catch (sendErr) {
          console.error('Failed to send batch email', sendErr);
          await logError(sendErr, req);
        }

        // small delay between batches to avoid bursts
        if (i + batchSize < recipients.length) await sleep(batchDelayMs);
      }
    } else {
      // No email host configured or no recipients -> just log (safe fallback)
      if (recipients.length) {
        console.log('SMTP not configured. Would have sent to:', recipients);
      } else {
        console.log('No recipients resolved for event', newEvent._id);
      }
    }

    // Return response: JSON for AJAX, redirect for normal form
    const successMessage = 'Event successfully created';
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(201).json({ message: successMessage, eventId: newEvent._id });
    }
    return res.redirect('/?success=1&msg=' + encodeURIComponent(successMessage));
  } catch (error) {
    console.log(`Error from model: ${error}`);
    await logError(error, req);

    const errMsg = 'Event was not created';
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(500).json({ status: false, message: errMsg });
    }
    return res.redirect('/?error=1&msg=' + encodeURIComponent(errMsg));
  }
});

export default createEventRouter;
