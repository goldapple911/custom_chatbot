import axios from "axios"

const baseUrl = 'https://api.openai.com/v1/'

export const createImg = (prompt: string, size: string, n: number) => {
	const res: any = axios.post(`${baseUrl}images/generations`, {
		model: 'dall-e-3',
		prompt,
		size,
		n,
		response_format: "url"
	},
	{
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
		},
	})

	console.log(process.env.OPENAI_API_KEY)

	return res.data;
}