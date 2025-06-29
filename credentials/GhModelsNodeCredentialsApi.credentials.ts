import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GhModelsNodeCredentialsApi implements ICredentialType {
	name = 'ghModelsNodeCredentialsApi';
	displayName = 'Github Models Credentials API';

	documentationUrl = 'https://qkxlimfz.manus.space/';

	properties: INodeProperties[] = [

		{
			displayName: 'Github Token',
			name: 'githubToken',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				// Authorization: 'Bearer {{ $credentials.githubToken }}',
				Authorization: '={{"Bearer " + $credentials.githubToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			url: 'https://api.github.com/user',
		},
	};
}
