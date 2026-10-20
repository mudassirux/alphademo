import type { Contact, ContactDraft, Stage } from '../types/contact';
import { getInitials } from '../utils/initials';

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'contact-001',
    name: 'Adnan Khan',
    email: 'adnan.khan@northstar.io',
    company: 'Northstar Labs',
    role: 'Product Lead',
    owner: 'Priya Nair',
    labels: ['Enterprise', 'SaaS'],
    stage: 'Lead',
    notes: 'Asked for a short overview before booking a demo. Highly interested in automated team onboarding.',
    avatarColor: '#2383e2'
  },
  {
    id: 'contact-002',
    name: 'Atifa Rahman',
    email: 'atifa.r@fieldnote.dev',
    company: 'Fieldnote Systems',
    role: '',
    owner: 'Arjun Rao',
    labels: ['Warm intro'],
    stage: 'Lead',
    notes: '',
    avatarColor: '#2383e2'
  },
  {
    id: 'contact-003',
    name: 'Priya Nair',
    email: '',
    company: '',
    role: 'Design Director',
    owner: 'Unassigned',
    labels: ['Product feedback'],
    stage: 'Lead',
    notes: '',
    avatarColor: '#2383e2'
  },
  {
    id: 'contact-004',
    name: 'Marcus Chen',
    email: 'marcus.chen@cedarco.com',
    company: 'Cedar & Co.',
    role: 'Operations Manager',
    owner: 'Priya Nair',
    labels: ['Partner', 'High intent'],
    stage: 'Prospect',
    notes: 'Requested custom volume pricing details for a team of 35 seats.',
    avatarColor: '#2383e2'
  },
  {
    id: 'contact-005',
    name: 'Jin Park',
    email: 'jin.park@monostudio.io',
    company: '',
    role: 'People Operations',
    owner: 'Unassigned',
    labels: ['Renewal'],
    stage: 'Prospect',
    notes: 'Annual team license renewal inquiry.',
    avatarColor: '#2383e2'
  },
  {
    id: 'contact-006',
    name: 'Theo Bennett',
    email: '',
    company: '',
    role: 'VP of Engineering',
    owner: 'Samira Khan',
    labels: ['Enterprise'],
    stage: 'Prospect',
    notes: '',
    avatarColor: '#2383e2'
  },
  {
    id: 'contact-007',
    name: 'Oliver Grant',
    email: 'oliver.g@atlasworks.co',
    company: 'AtlasWorks',
    role: '',
    owner: 'Unassigned',
    labels: [],
    stage: 'Prospect',
    notes: 'Security architecture review scheduled after the sprint demo.',
    avatarColor: '#2383e2'
  },
  {
    id: 'contact-008',
    name: 'Elena Torres',
    email: 'elena.t@paperplane.ai',
    company: 'Paperplane AI',
    role: 'CTO',
    owner: 'Priya Nair',
    labels: ['SaaS', 'High intent'],
    stage: 'Qualified',
    notes: 'Evaluated latency specs and SSO integration. Requested vendor security packet.',
    avatarColor: '#2383e2'
  },
  {
    id: 'contact-009',
    name: 'Samira Haddad',
    email: '',
    company: 'Goodwell Health',
    role: 'Partnerships Lead',
    owner: 'Alex Rivera',
    labels: ['Partner'],
    stage: 'Qualified',
    notes: '',
    avatarColor: '#2383e2'
  },
  {
    id: 'contact-010',
    name: 'Noah Williams',
    email: '',
    company: 'Crestline Data',
    role: '',
    owner: 'Neha Kapoor',
    labels: [],
    stage: 'Qualified',
    notes: '',
    avatarColor: '#2383e2'
  },
  {
    id: 'contact-011',
    name: 'Fatima Al-Khatib',
    email: 'fatima.k@beaconmobility.com',
    company: 'Beacon Mobility',
    role: 'Head of Growth',
    owner: 'Priya Nair',
    labels: ['Enterprise', 'Partner'],
    stage: 'Qualified',
    notes: 'Exploring enterprise tier for 200+ users.',
    avatarColor: '#2383e2'
  },
  {
    id: 'contact-012',
    name: 'Asha Verma',
    email: 'asha.verma@horizoncloud.net',
    company: 'Horizon Cloud',
    role: 'VP Product',
    owner: 'Samira Khan',
    labels: ['Enterprise'],
    stage: 'Qualified',
    notes: 'Active customer expanding seat tier and evaluating enterprise plan.',
    avatarColor: '#2383e2'
  }
];

export function initials(name: string): string {
  return getInitials(name);
}

export function createBlankDraft(defaultStage: Stage = 'Lead'): ContactDraft {
  return {
    name: '',
    email: '',
    company: '',
    role: '',
    owner: 'Unassigned',
    labels: [],
    stage: defaultStage,
    notes: ''
  };
}

export function getContactDraft(contact: Contact): ContactDraft {
  return {
    ...contact,
    labels: [...contact.labels]
  };
}
