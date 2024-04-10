import { createReadStream } from 'fs';
import { google } from 'googleapis';

const getId = () => String(new Date().getTime());

export const publish = async ({ keyFile, packageName, aabFile, title, status }) => {
	const client = await google.auth.getClient({
		keyFile,
		scopes: 'https://www.googleapis.com/auth/androidpublisher',
	});
	const body = createReadStream(aabFile);
	const androidPublisher = google.androidpublisher({
		version: 'v3',
		auth: client,
		params: {
			packageName,
		},
	});
	const id = getId();
	const edit = await androidPublisher.edits.insert({
		requestBody: {
			id,
			expiryTimeSeconds: '1000',
		},
	});
	const editId = String(edit.data.id);
	const bundle = await androidPublisher.edits.bundles.upload({
		editId,
		packageName,
		media: {
			mimeType: 'application/octet-stream',
			body,
		},
	});

	if (bundle.data.versionCode === undefined || bundle.data.versionCode === null) {
		throw new Error('Bundle versionCode cannot be undefined or null');
	}

	await androidPublisher.edits.tracks.update({
		editId,
		track: 'internal',
		packageName,
		requestBody: {
			track: 'internal',
			releases: [
				{
					name: `${title} (v${bundle.data.versionCode})`,
					status: status,
					versionCodes: [String(bundle.data.versionCode)],
				},
			],
		},
	});
	await androidPublisher.edits.commit({
		editId,
		packageName,
	});
};
