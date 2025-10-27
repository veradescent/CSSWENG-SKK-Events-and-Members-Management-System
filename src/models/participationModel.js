import { Schema } from "mongoose";
const { Schema, model } = mongoose

const participationSchema = new Schema({
    user: {
        type: SchemaTypes.ObjectId,
        ref: 'member',
        required: true
    },
    eventskk: {
        type: SchemaTypes.ObjectId,
        ref: 'events',
        required: true
    }
});

const Participation = model('participation', participationSchema);
export default Participation;
