import update from '@/hook/update';
import mounted from '@/hook/mounted';

const effect = (
  forward: () => (() => void) | void,
  backward: () => (() => void) | void,
  dependencies: () => any[] = () => []
) => {
  mounted(() => {
    forward();

    return backward;
  });

  update(() => {
    backward();

    return forward;
  }, dependencies);
};
export default effect;
