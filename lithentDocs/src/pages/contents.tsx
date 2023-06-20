import { h, mount } from 'lithent';
import { ContentHeader } from '@/components/contentHeader';

export const Guide = mount(() => {
  return () => (
    <div class="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-4 bg-gray-900">
      <ContentHeader title="예제1" />
      {/*<!-- Right Content --> */}
      <div class="col-span-full xl:col-auto">
        <div class="p-4 mb-4 space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 border-gray-700 sm:p-6 bg-gray-800">
          <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600">
            <h3>Card header</h3>
          </div>
          <div class="h-32 px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600">
            <h3>Card body</h3>
          </div>
          <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600">
            <h3>Card footer</h3>
          </div>
        </div>
        <div class="p-4 mb-4 space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 border-gray-700 sm:p-6 bg-gray-800">
          <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600">
            <h3>Card header</h3>
          </div>
          <div class="h-32 px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600">
            <h3>Card body</h3>
          </div>
          <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600">
            <h3>Card footer</h3>
          </div>
        </div>
      </div>
      <div class="col-span-2">
        <div class="p-4 mb-4 space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 border-gray-700 sm:p-6 bg-gray-800">
          <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600">
            <h3>Card header</h3>
          </div>
          <div class="h-32 px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600">
            <h3>Card body</h3>
          </div>
          <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600">
            <h3>Card footer</h3>
          </div>
        </div>
        <div class="p-4 mb-4 space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 border-gray-700 sm:p-6 bg-gray-800">
          <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600">
            <h3>Card header</h3>
          </div>
          <div class="h-32 px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600">
            <h3>Card body</h3>
          </div>
          <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600">
            <h3>Card footer</h3>
          </div>
        </div>
      </div>
    </div>
  );
});
