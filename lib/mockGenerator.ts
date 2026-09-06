import { MasterSermon } from '@/types/sermon';

export async function buildMockMasterSermon(rawNotes: any): Promise<MasterSermon> {
  const title = (rawNotes?.title as string) || 'Mock Sermon Title';
  const bigIdea = (rawNotes?.bigIdea as string) || 'God loves us and calls us to follow.';
  const desiredResponse = (rawNotes?.desiredResponse as string) || 'Trust & obedience.';

  const movements = [
    {
      id: 'm-1',
      title: 'Opening & Exhortation',
      content: 'Introduce passage and set context. Connect with audience need.',
      priority: 'must',
      locked: false,
      order: 0,
    },
    {
      id: 'm-2',
      title: 'Exposition',
      content: 'Walk through the passage, explain key phrases, and highlight theological points.',
      priority: 'normal',
      locked: false,
      order: 1,
    },
    {
      id: 'm-3',
      title: 'Application',
      content: 'Give concrete ways the congregation can respond in the coming week.',
      priority: 'normal',
      locked: false,
      order: 2,
    },
  ];

  return {
    title,
    bigIdea,
    desiredResponse,
    movements,
  };
}
