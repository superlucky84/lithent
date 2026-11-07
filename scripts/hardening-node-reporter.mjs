// Node's reporter events retain assertion codes; a worker/setup error is never
// evidence that a deliberately broken safety check was detected.
export default async function* reporter(events) {
  const tests = [];
  for await (const event of events) {
    if (!['test:pass', 'test:fail'].includes(event.type)) continue;
    const data = event.data;
    if (data.details?.type === 'suite') continue;
    const error = data.details?.error;
    tests.push({
      name: data.name,
      status:
        event.type === 'test:fail'
          ? 'failed'
          : data.skip || data.todo
            ? 'skipped'
            : 'passed',
      assertion:
        error?.code === 'ERR_ASSERTION' ||
        error?.cause?.code === 'ERR_ASSERTION',
      message: error?.cause?.message ?? error?.message,
    });
  }
  yield JSON.stringify({ schemaVersion: 1, tests }) + '\n';
}
