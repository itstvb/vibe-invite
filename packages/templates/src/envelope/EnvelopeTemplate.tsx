'use client';

import type { InvitationConfig, TemplateConfigSchema } from '@vibeinvite/types';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useEnvelopeAnimation } from './useEnvelopeAnimation';
import type { RsvpFormData, TemplateProps } from '../types';
import './envelope.css';

export const envelopeSchema: TemplateConfigSchema = {
  fields: [
    { key: 'recipientName', label: 'Recipient Name', type: 'text', required: true, placeholder: 'e.g. Sarah' },
    { key: 'hostName', label: 'From', type: 'text', required: true, placeholder: 'e.g. The Johnson Family' },
    {
      key: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
      maxLength: 400,
      placeholder: 'Your heartfelt message...'
    },
    { key: 'date', label: 'Event Date', type: 'date', required: false },
    { key: 'time', label: 'Event Time', type: 'time', required: false },
    { key: 'venue', label: 'Venue / Location', type: 'text', required: false },
    {
      key: 'envelopeShape',
      label: 'Envelope Shape',
      type: 'select',
      required: true,
      options: [
        { label: 'Classic', value: 'classic' },
        { label: 'Square', value: 'square', isPro: true },
        { label: 'Vintage', value: 'vintage', isPro: true },
        { label: 'Modern', value: 'modern', isPro: true }
      ]
    },
    {
      key: 'paperTexture',
      label: 'Paper Texture',
      type: 'select',
      required: true,
      options: [
        { label: 'Plain', value: 'plain' },
        { label: 'Lined', value: 'lined' },
        { label: 'Grid', value: 'grid', isPro: true },
        { label: 'Dotted', value: 'dotted', isPro: true },
        { label: 'Linen', value: 'linen', isPro: true },
        { label: 'Kraft', value: 'kraft', isPro: true },
        { label: 'Aged', value: 'aged', isPro: true }
      ]
    }
  ],
  colors: [
    { key: 'primaryColor', label: 'Envelope Color', default: '#FFD6C0' },
    { key: 'accentColor', label: 'Seal Color', default: '#B5456A' },
    { key: 'paperColor', label: 'Paper Color', default: '#FFFBF0' },
    { key: 'backgroundColor', label: 'Background', default: '#fce4ec' }
  ],
  fonts: [
    {
      key: 'displayFont',
      label: 'Heading Font',
      default: 'Playfair Display',
      options: [
        { label: 'Playfair Display', value: 'Playfair Display' },
        { label: 'Dancing Script', value: 'Dancing Script' },
        { label: 'Cormorant Garamond', value: 'Cormorant Garamond' }
      ]
    }
  ],
  animations: [
    {
      key: 'entranceAnimation',
      label: 'Entrance Animation',
      type: 'select',
      default: 'float',
      options: [
        { label: 'Float', value: 'float' },
        { label: 'Drop', value: 'drop' },
        { label: 'Slide Left', value: 'slide_left', isPro: true },
        { label: 'Slide Right', value: 'slide_right', isPro: true },
        { label: 'Spin Drop', value: 'spin_drop', isPro: true },
        { label: 'Typewriter', value: 'typewriter', isPro: true }
      ]
    },
    { key: 'floatSpeed', label: 'Float Speed', type: 'range', min: 1, max: 5, step: 0.5, default: 3 }
  ],
  assets: [
    { key: 'stampKey', label: 'Stamp', type: 'stamp', collection: 'stampPacks' },
    { key: 'stickerSlots', label: 'Stickers', type: 'sticker', collection: 'stickerPacks', isPro: true }
  ]
};

export const envelopeDefaults: InvitationConfig = {
  recipientName: 'The MVP',
  hostName: 'The Whole Squad',
  message:
    'Today the world is a little brighter because you are in it. May this year bring you every joy you deserve, and then some.',
  date: '',
  time: '',
  venue: '',
  primaryColor: '#FFD6C0',
  accentColor: '#B5456A',
  paperColor: '#FFFBF0',
  backgroundColor: '#fce4ec',
  displayFont: 'Playfair Display',
  entranceAnimation: 'float',
  floatSpeed: 3,
  envelopeShape: 'classic',
  paperTexture: 'plain',
  stampKey: 'default_heart',
  stickerSlots: {
    envelopeTopLeft: null,
    envelopeBottomRight: null,
    letterTopRight: null,
    letterBottomLeft: null
  },
  rsvpEnabled: true
};

export function EnvelopeTemplate({ config, isPreview = false, onRsvp }: TemplateProps) {
  const { opened, showModal, openEnvelope } = useEnvelopeAnimation(isPreview);
  const [showRsvp, setShowRsvp] = useState(false);

  const colors = getEnvelopeColors(config);
  const entranceAnimation = getString(config.entranceAnimation, 'float');
  const paperTexture = getString(config.paperTexture, 'plain');

  return (
    <section
      className={`envelope-scene envelope-${entranceAnimation}`}
      style={
        {
          '--primary': colors.primary,
          '--accent': colors.accent,
          '--paper': colors.paper,
          '--bg': colors.background
        } as React.CSSProperties
      }
    >
      <button
        className={`envelope-card ${opened ? 'is-open' : ''}`}
        type="button"
        onClick={openEnvelope}
        aria-label="Open invitation"
      >
        <span className="envelope-flap" />
        <span className="envelope-seal">{getString(config.stampKey, 'default_heart') === 'default_heart' ? '♥' : '✦'}</span>
        <span className="envelope-label">For {getString(config.recipientName, 'you')}</span>
      </button>

      {showModal && (
        <div className={`letter paper-${paperTexture}`}>
          <p className="letter-eyebrow">You are invited</p>
          <h1 style={{ fontFamily: getString(config.displayFont, 'serif') }}>
            {getString(config.recipientName, 'Friend')}
          </h1>
          <p>{getString(config.message, '')}</p>
          <dl>
            {getString(config.date, '') && (
              <>
                <dt>Date</dt>
                <dd>{getString(config.date, '')}</dd>
              </>
            )}
            {getString(config.venue, '') && (
              <>
                <dt>Venue</dt>
                <dd>{getString(config.venue, '')}</dd>
              </>
            )}
          </dl>
          <p className="letter-signature">From {getString(config.hostName, 'your host')}</p>
          {config.rsvpEnabled && !isPreview && onRsvp && (
            <button className="rsvp-toggle" type="button" onClick={() => setShowRsvp(true)}>
              RSVP
            </button>
          )}
        </div>
      )}

      {showRsvp && onRsvp && <RsvpForm onSubmit={onRsvp} onClose={() => setShowRsvp(false)} />}
    </section>
  );
}

function RsvpForm({ onSubmit, onClose }: { onSubmit: (data: RsvpFormData) => Promise<void>; onClose: () => void }) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onSubmit({
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      response: String(formData.get('response') ?? 'yes') as RsvpFormData['response'],
      message: String(formData.get('message') ?? '')
    });
    onClose();
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input name="name" required />
      </label>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Response
        <select name="response" defaultValue="yes">
          <option value="yes">Yes</option>
          <option value="maybe">Maybe</option>
          <option value="no">No</option>
        </select>
      </label>
      <label>
        Message
        <textarea name="message" />
      </label>
      <button type="submit">Send RSVP</button>
      <button type="button" onClick={onClose}>
        Close
      </button>
    </form>
  );
}

function getEnvelopeColors(config: InvitationConfig) {
  return {
    primary: getString(config.primaryColor, '#FFD6C0'),
    accent: getString(config.accentColor, '#B5456A'),
    paper: getString(config.paperColor, '#FFFBF0'),
    background: getString(config.backgroundColor, '#fce4ec')
  };
}

function getString(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback;
}
