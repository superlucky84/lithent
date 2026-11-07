import policy from '../.github/release-policy.json' with { type: 'json' };
import { validateReleasePolicy } from './release-policy.mjs';

// One catalog serves packing and candidate selection. Private workspaces and
// packaged subpaths are never independently registered by discovery.
export const releasePolicy = validateReleasePolicy(policy);
export const releasePackages = releasePolicy.packages;
