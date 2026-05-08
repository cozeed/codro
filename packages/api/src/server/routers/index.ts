import { router } from '../trpc';
import postRouter from './post';
import modelProviderRouter from './model-provider';
import { threadRouter } from './thread';
import { messageRouter } from './message';
import { fileDataRouter } from './file-data';


export const appRouter = router({
	posts: postRouter,
	modelProviders: modelProviderRouter,
	threads: threadRouter,
	messages: messageRouter,
	fileDatas: fileDataRouter,
});