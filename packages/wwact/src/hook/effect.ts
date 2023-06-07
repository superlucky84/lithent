import update from '@/hook/update';
import mounted from '@/hook/mounted';

export default function effect(
  forward: () => (() => void) | void,
  backward: () => (() => void) | void,
  dependencies: () => any[] = () => []
) {
  mounted(() => {
    forward();

    return backward;
  });

  update(() => {
    backward();

    return forward;
  }, dependencies);
}
