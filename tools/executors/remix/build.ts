import { ExecutorContext } from '@nrwl/devkit';
import { exec } from 'child_process';
import { promisify } from 'util';

// export interface EchoExecutorOptions {
//   textToEcho: string;
// }

import { FsTree } from 'nx/src/shared/tree';


export default async function runExecutor(
  options: any,
  context: ExecutorContext
) {
  if (!context.projectName) {
    throw new Error('No projectName');
  }
  const tree = new FsTree(context.cwd, context.isVerbose);
  const appRoot = context.workspace.projects[context.projectName].root;

  const { stdout, stderr } = await promisify(exec)(
    `nx run remix-app:build`
  );

  return {
    success: true,
  };
}
