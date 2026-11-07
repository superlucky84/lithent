import { pathToFileURL } from 'node:url';

export function assertSuccessfulJobs(jobs) {
  if (!jobs || !Object.keys(jobs).length)
    throw new Error('No CI jobs were checked');
  for (const [name, result] of Object.entries(jobs))
    if (result !== 'success') throw new Error(`CI job ${name}: ${result}`);
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const needs = JSON.parse(process.argv[2]);
    // These jobs are mandatory even if the workflow is accidentally edited.
    assertSuccessfulJobs({
      quality: needs.quality?.result,
      browser: needs.browser?.result,
    });
    assertSuccessfulJobs(
      Object.fromEntries(
        Object.entries(needs).map(([name, job]) => [name, job.result])
      )
    );
    console.log('PASS all mandatory CI jobs');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
