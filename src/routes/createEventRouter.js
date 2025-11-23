// src/routes/createEventRouter.js
import { Router } from "express";
import Participation from "../models/participationModel.js";
import Event from "../models/eventsModel.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import logError from '../../logError.js';
import Member from '../models/memberModel.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import nodemailer from 'nodemailer'; // optional - only used if SMTP env vars set

const createEventRouter = Router();
dayjs.extend(utc);
dayjs.extend(timezone);

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
      user: req.user || null
    });
  } catch (err) {
    console.error('Error fetching members for createEvent', err);
    await logError(err, req);
    return res.status(500).send('Server error');
  }
});

/**
 * POST /createEvent
 * Create a new event. Also optionally sends email invitations if configured or requested.
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
      customMembers // expect array of member ids (from checkboxes)
    } = req.body || {};

    // Basic validation
    if (!eventName) {
      return res.status(400).json({ status: false, message: 'Event name is required' });
    }

    const start = startDateTime ? new Date(startDateTime) : null;
    const end = endDateTime ? new Date(endDateTime) : null;
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ status: false, message: 'Invalid start or end date' });
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
      createdBy: req.user ? req.user._id : null
    });

    await newEvent.save();

    // Determine recipients depending on sendAll or customMembers
    let recipients = [];
    try {
      if (sendAll === 'on' || sendAll === true || sendAll === 'true') {
        // send to all members with an email
        const allMembers = await Member.find({ email: { $exists: true, $ne: '' } }).lean();
        recipients = allMembers.map(m => m.email).filter(Boolean);
      } else if (customMembers) {
        // customMembers may be single string or array of ids
        const ids = Array.isArray(customMembers) ? customMembers : [customMembers];
        const selected = await Member.find({ _id: { $in: ids } }).lean();
        recipients = selected.map(m => m.email).filter(Boolean);
      }
    } catch (memberErr) {
      // If fetching recipients fails, log but don't crash the event creation
      console.error('Failed to resolve recipients', memberErr);
      await logError(memberErr, req);
    }

    // If SMTP configured, attempt to send notifications. Otherwise, log recipients.
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost && recipients.length > 0) {
      // Build transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: (process.env.SMTP_SECURE === 'true'), // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Create message (simple plain-text invitation)
      const message = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: recipients, // array allowed
        subject: `Invitation: ${newEvent.eventName}`,
        text: `You're invited to ${newEvent.eventName}.\n\n${newEvent.eventDescription}\n\nLocation: ${newEvent.location}\nStart: ${newEvent.startDateTime}\nEnd: ${newEvent.endDateTime}`
      };

      try {
        await transporter.sendMail(message);
        console.log('Invitation emails sent to', recipients.length, 'addresses');
      } catch (emailErr) {
        console.error('Failed to send invitation emails', emailErr);
        await logError(emailErr, req);
      }
    } else {
      // No SMTP; log recipients (safe for dev)
      if (recipients.length) {
        console.log('Email not sent - SMTP not configured. Would have sent to:', recipients);
      }
    }

    return res.status(201).json({
      message: 'Event successfully created'
    });
  } catch (error) {
    console.log(`Error from model: ${error}`);
    await logError(error, req);
    return res.status(500).json({
      status: false,
      message: 'Event was not created'
    });
  }
});

export default createEventRouter;
