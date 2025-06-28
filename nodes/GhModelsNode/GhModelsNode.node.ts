import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import axios from 'axios';

export class GhModelsNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Github Models',
		name: 'ghModelsNode',
		icon: 'file:ghModelsNode.svg',
		group: ['HaiDang'],
		version: 1.0,
		description: 'This node encapsulates the functionality for the github models API.',
		defaults: {
			name: 'GH Models Node',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Model',
				name: 'modelName',
				type: 'options',
				options: [
					{
						name: 'OpenAI GPT-4.1',
						value: 'openai/gpt-4.1',
						description: 'Gpt-4.1 outperforms gpt-4o across the board, with major gains in coding, instruction following, and long-context understanding',
					},
					{
						name: 'OpenAI GPT-4.1-Mini',
						value: 'openai/gpt-4.1-mini',
						description: 'Gpt-4.1-mini outperform gpt-4o-mini across the board, with major gains in coding, instruction following, and long-context handling',
					},
					{
						name: 'OpenAI GPT-4.1-Nano',
						value: 'openai/gpt-4.1-nano',
						description: 'Gpt-4.1-nano provides gains in coding, instruction following, and long-context handling along with lower latency and cost',
					},
					{
						name: 'OpenAI GPT-4o',
						value: 'openai/gpt-4o',
						description: "OpenAI's most advanced multimodal model in the gpt-4o family. Can handle both text and image inputs.",
					},
					{
						name: 'OpenAI GPT-4o Mini',
						value: 'openai/gpt-4o-mini',
						description: 'An affordable, efficient AI solution for diverse text and image tasks',
					},
					{
						name: 'OpenAI O1',
						value: 'openai/o1',
						description: 'Focused on advanced reasoning and solving complex problems, including math and science tasks. Ideal for applications that require...',
					},
					{
						name: 'OpenAI O1-Mini',
						value: 'openai/o1-mini',
						description: 'Smaller, faster, and 80% cheaper than o1-preview, performs well at code generation and small context operations',
					},
					{
						name: 'OpenAI O1-Preview',
						value: 'openai/o1-preview',
						description: 'Focused on advanced reasoning and solving complex problems, including math and science tasks. Ideal for applications that require...',
					},
					{
						name: 'OpenAI O3',
						value: 'openai/o3',
						description: 'O3 includes significant improvements on quality and safety while supporting the existing features of o1 and delivering comparable',
					},
					{
						name: 'OpenAI O3-Mini',
						value: 'openai/o3-mini',
						description: 'O3-mini includes the o1 features with significant cost-efficiencies for scenarios requiring high performance',
					},
					{
						name: 'OpenAI O4-Mini',
						value: 'openai/o4-mini',
						description: 'O4-mini includes significant improvements on quality and safety while supporting the existing features of o3-mini and delivering',
					},
					{
						name: 'OpenAI Text Embedding 3 (Large)',
						value: 'openai/text-embedding-3-large',
						description: 'Text-embedding-3 series models are the latest and most capable embedding model from OpenAI',
					},
					{
						name: 'OpenAI Text Embedding 3 (Small)',
						value: 'openai/text-embedding-3-small',
						description: 'Text-embedding-3 series models are the latest and most capable embedding model from OpenAI',
					},
				],
				default: 'openai/gpt-4o',
				description:
					"OpenAI's most advanced multimodal model in the gpt-4o family. Can handle both text and image inputs.",
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'fixedCollection',
				placeholder: 'Add Message',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'List of messages sent to the model',
				options: [
					{
						displayName: 'Message',
						name: 'message',
						values: [
							{
								displayName: 'Prompt',
								name: 'prompt',
								type: 'string',
								default: '',
								typeOptions: {
									rows: 5,
								},
								placeholder: 'e.g. Hello, how can you help me?',
							},
							{
								displayName: 'Role',
								name: 'role',
								type: 'options',
								default: 'user',
								options: [
									{
										name: 'User',
										value: 'user',
									},
									{
										name: 'Assistant',
										value: 'assistant',
									},
									{
										name: 'System',
										value: 'system',
									},
								],
							},
						],
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'fixedCollection',
				default: {},
				placeholder: 'Add option',
				description: "Model's configurations",
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Temperature',
						name: 'temperature',
						values: [
							{
								displayName: 'Value',
								name: 'value',
								type: 'number',
								default: 1.0,
							},
						],
					},
					{
						displayName: 'Top P',
						name: 'top_p',
						values: [
							{
								displayName: 'Value',
								name: 'value',
								type: 'number',
								default: 1.0,
							},
						],
					},
					{
						displayName: 'Max Tokens',
						name: 'max_tokens',
						values: [
							{
								displayName: 'Value',
								name: 'value',
								type: 'number',
								default: 1024,
							},
						],
					},
				],
			},
			{
				displayName: 'Output as JSON',
				name: 'json_format',
				default: false,
				description: "Whether the model will send output as JSON data",
				type: 'boolean',
			},
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const endPoint: string = 'https://models.github.ai/inference/chat/completions';

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const modelName = this.getNodeParameter('modelName', i) as string;
				const rawMessages = this.getNodeParameter('messages', i, []) as {
					message: Array<{ prompt: string; role: string }>;
				};
				const rawOptions = this.getNodeParameter('options', i, {}) as any;

				const jsonFormat = this.getNodeParameter('json_format', i, false) as boolean;

				// Chuyển đổi định dạng messages
				const messages = rawMessages.message.map((m) => ({
					role: m.role,
					content: m.prompt,
				}));

				// Lấy credentials đã được mã hóa
				const credentials = await this.getCredentials('ghModelsNodeCredentialsApi');
				const token = credentials.githubToken;

				// Build payload
				const body: Record<string, any> = {
					model: modelName,
					messages,
					...Object.fromEntries(
						Object.entries(rawOptions).map(([k, v]: [string, any]) => [k, v.value]),
					),
				};

				// Gọi API
				const response = await axios.post(endPoint, body, {
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				});

				// Ghi kết quả vào item output
				const output = jsonFormat
					? response.data
					: { result: response.data.choices?.[0]?.message?.content || null };

				returnData.push({
					json: output,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});

					continue;
				}

				throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
