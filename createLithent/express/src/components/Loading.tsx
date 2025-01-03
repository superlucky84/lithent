import { mount } from 'lithent';

const LoadingText = mount(() => {
  return () => (
    <div class="flex justify-center items-center h-screen text-2xl md:text-4xl font-semibold">
      <span class="relative before:content-[var(--dots)] animate-dots" />
    </div>
  );
});

export default LoadingText;
