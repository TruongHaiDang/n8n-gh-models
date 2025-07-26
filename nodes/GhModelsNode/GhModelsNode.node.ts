import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

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
		credentials: [
			{
				name: 'ghModelsNodeCredentialsApi', // phải khớp với `name` trong file credentials
				required: true,
			},
		],
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Model Name or ID',
				name: 'modelName',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getAllModels',
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
				description: 'Whether the model will send output as JSON data',
				type: 'boolean',
			},
		],
	};
	methods = {
		loadOptions: {
			async getAllModels(this: ILoadOptionsFunctions) {
				const credentials = await this.getCredentials('ghModelsNodeCredentialsApi');
				const token = credentials.githubToken;

				const response = await this.helpers.httpRequest.call(this, {
					method: 'GET',
					url: 'https://models.github.ai/catalog/models',
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: 'application/vnd.github+json',
					},
					json: true,
				});

				return response.map((model: any) => ({
					name: `${model.name || model.id} (${model.publisher})`,
					value: model.id,
					description: model.summary || model.description || '',
				}));
			},
		},
	};

	/**
	 * Hàm thực thi chính của node.
	 * Nhận dữ liệu đầu vào, gọi GitHub Models API bằng httpRequest của n8n
	 * và trả về kết quả cho workflow.
	 */
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

				// Tùy chọn cho yêu cầu HTTP
				const requestOptions: IHttpRequestOptions = {
					method: 'POST',
					url: endPoint,
					body,
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					json: true,
				};

				// Gọi API bằng httpRequest của n8n
				const response = (await this.helpers.httpRequest.call(this, requestOptions)) as any;

				// Ghi kết quả vào item output
				const output = jsonFormat
					? response
					: { result: response.choices?.[0]?.message?.content || null };

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
