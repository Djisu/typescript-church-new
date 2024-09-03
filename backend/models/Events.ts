import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  registrations: { memberId: mongoose.Types.ObjectId; registeredAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  registrations: [
    {
      memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
      registeredAt: { type: Date, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Event = mongoose.model<IEvent>('Event', EventSchema);