import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse, experimental_StreamData } from 'ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages, data } = await req.json()

  const initialMessages = messages.slice(0, -1)
  const currentMessage = messages[messages.length - 1]

  const base64Images: string[] = JSON.parse(data.base64Images)

  const images = base64Images.map((base64Image) => ({
    type: 'image_url',
    image_url: base64Image,
  }))

  const dalle_image = await openai.images.generate({
    model: 'dall-e-3',
    prompt: currentMessage.content,
    quality: 'standard',
    size: '1024x1024',
    n: 1,
  });

  const external_data = new experimental_StreamData();

  const imageUrl = dalle_image.data[0].url as string;


  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    stream: true,
    max_tokens: 150,
    messages: [
      ...initialMessages,
      {
        ...currentMessage,
        content: [{ type: 'text', text: currentMessage.content }, ...images],
      },
    ],


  })

  console.log("response", response)

  // const stream = OpenAIStream(response, experimental_streamData: true,)

  const stream = OpenAIStream(response, {
    onFinal(completion) {
      // IMPORTANT! you must close StreamData manually or the response will never finish.
      external_data.close();
    },
    experimental_streamData: true,
  });

  external_data.append({
    text: imageUrl
  })

  return new StreamingTextResponse(stream, {}, external_data)
}
