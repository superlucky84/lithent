declare const __STATIC_DIAGNOSTIC__: boolean;
export const metrics = {
  wdCreated: 0,
  diffVisits: 0,
  updateVisits: 0,
  domCreates: 0,
  propPasses: 0,
  textWrites: 0,
  attrWrites: 0,
  eventAdds: 0,
  eventRemoves: 0,
  materialized: 0,
  fastBlocks: 0,
  comparedSlots: 0,
  templateClones: 0,
};
export const resetMetrics = () => {
  if (__STATIC_DIAGNOSTIC__)
    for (const key of Object.keys(metrics) as (keyof typeof metrics)[])
      metrics[key] = 0;
};
