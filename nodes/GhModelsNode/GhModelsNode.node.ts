import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class GhModelsNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Github Models',
		name: 'ghModelsNode',
		group: ['HaiDang'],
		version: 1,
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
						name: 'OpenAI o4-mini',
						value: 'openai/o4-mini',
						description:
							'o4-mini includes significant improvements on quality and safety while supporting the existing features of o3-mini and delivering...',
					},
					{
						name: 'OpenAI o3',
						value: 'openai/o3',
						description:
							'o3 includes significant improvements on quality and safety while supporting the existing features of o1 and delivering comparable ...',
					},
					{
						name: 'OpenAI GPT-4.1-mini',
						value: 'openai/gpt-4.1-mini',
						description:
							'gpt-4.1-mini outperform gpt-4o-mini across the board, with major gains in coding, instruction following, and long-context handling.',
					},
					{
						name: 'OpenAI GPT-4.1-nano',
						value: 'openai/gpt-4.1-nano',
						description:
							'gpt-4.1-nano provides gains in coding, instruction following, and long-context handling along with lower latency and cost.',
					},
					{
						name: 'OpenAI GPT-4.1',
						value: 'openai/gpt-4.1',
						description:
							'gpt-4.1 outperforms gpt-4o across the board, with major gains in coding, instruction following, and long-context understanding.',
					},
					{
						name: 'OpenAI Text Embedding 3 (small)',
						value: 'openai/text-embedding-3-small',
						description:
							'Text-embedding-3 series models are the latest and most capable embedding model from OpenAI.',
					},
					{
						name: 'OpenAI Text Embedding 3 (large)',
						value: 'openai/text-embedding-3-large',
						description:
							'Text-embedding-3 series models are the latest and most capable embedding model from OpenAI.',
					},
					{
						name: 'OpenAI o3-mini',
						value: 'openai/o3-mini',
						description:
							'o3-mini includes the o1 features with significant cost-efficiencies for scenarios requiring high performance.',
					},
					{
						name: 'OpenAI o1-preview',
						value: 'openai/o1-preview',
						description:
							'Focused on advanced reasoning and solving complex problems, including math and science tasks. Ideal for applications that require...',
					},
					{
						name: 'OpenAI o1-mini',
						value: 'openai/o1-mini',
						description:
							'Smaller, faster, and 80% cheaper than o1-preview, performs well at code generation and small context operations.',
					},
					{
						name: 'OpenAI o1',
						value: 'openai/o1',
						description:
							'Focused on advanced reasoning and solving complex problems, including math and science tasks. Ideal for applications that require...',
					},
					{
						name: 'OpenAI GPT-4o',
						value: 'openai/gpt-4o',
						description:
							"OpenAI's most advanced multimodal model in the gpt-4o family. Can handle both text and image inputs.",
					},
					{
						name: 'OpenAI GPT-4o mini',
						value: 'openai/gpt-4o-mini',
						description: 'An affordable, efficient AI solution for diverse text and image tasks.',
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
						displayName: 'Max tokens',
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
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let myString: string;

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				myString = this.getNodeParameter('myString', itemIndex, '') as string;
				item = items[itemIndex];

				item.json.myString = myString;
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
