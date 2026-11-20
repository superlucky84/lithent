// A component next to an ordinary export: changing the value propagates.
export const mixedValue = 'mixed original';
export const MixedBadge = () => <span class="storm-mixed">{mixedValue}</span>;
