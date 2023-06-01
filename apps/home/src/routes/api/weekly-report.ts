import { Configuration, OpenAIApi } from 'openai';
import invariant from 'tiny-invariant';
// handles HTTP GET requests to /api/students
const openAIKey = process.env.OPEN_AI_KEY;
const resuceTimeKey = process.env.RESCUE_TIME_KEY;
const wakatimeKey = process.env.WAKA_TIME_KEY;

invariant(openAIKey, 'openAIKey must be set in your environment variables.');
invariant(
  resuceTimeKey,
  'resuceTimeKey must be set in your environment variables.'
);
invariant(
  wakatimeKey,
  'wakatimeKey must be set in your environment variables.'
);
const configuration = new Configuration({ apiKey: openAIKey });
const openai = new OpenAIApi(configuration);

export function GET() {
  return new Response('Hello World');
}


