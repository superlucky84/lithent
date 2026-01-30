import { CodeBlock } from '@/components/CodeBlock';

export const AgentGuideKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      AI 에이전트 가이드
    </h1>

    <div class="border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-500/5 to-transparent dark:from-yellow-500/10 dark:to-transparent p-6 mb-6 rounded-r">
      <p class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
        ⚠️ 실험적 기능
      </p>
      <p class="text-xs md:text-sm text-gray-700 dark:text-gray-300">
        AI 에이전트 통합은 실험적 기능입니다. 플랫폼별 설정 방법은 AI 도구의
        발전에 따라 달라지거나 오래될 수 있습니다. 가장 정확한 안내는 해당 AI
        어시스턴트의 공식 문서를 참고하세요.
      </p>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent는 AI 코딩 어시스턴트와 함께 더 나은 개발 경험을 제공하기 위해 AI
      에이전트 스킬 파일을 제공합니다. 이 파일들은 AI 에이전트가 Lithent 패턴을
      이해하고, 더 나은 코드를 제안하며, 흔한 실수를 방지하도록 돕습니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      포함된 내용
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent는 스킬 번들 폴더와 에이전트 애드온 파일을 제공합니다:
    </p>

    <div class="grid md:grid-cols-2 gap-6 mb-8">
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800/50">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          skills/lithent/
        </h4>
        <p class="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-3">
          SKILL.md가 자체적으로 완결된 폴더형 스킬 번들
        </p>
        <ul class="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <li>• 컴포넌트 패턴 (mount/lmount)</li>
          <li>• 상태 관리</li>
          <li>• 라이프사이클 훅</li>
          <li>• Import 레퍼런스</li>
        </ul>
      </div>

      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800/50">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          lithent-agent-addon.md
        </h4>
        <p class="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-3">
          AI 에이전트가 Lithent 모범 사례를 따르도록 하는 행동 가이드라인
        </p>
        <ul class="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <li>• 코딩 가이드라인</li>
          <li>• 흔한 실수 감지</li>
          <li>• 패턴 제안</li>
          <li>• 자동 활성화 규칙</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      플랫폼별 설정
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      사용하시는 AI 코딩 어시스턴트를 선택하세요:
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-8 mb-4">
      Claude Code (CLI)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      프로젝트 루트에 에이전트 애드온 파일을 <code>CLAUDE.md</code>로
      추가하세요:
    </p>

    <CodeBlock
      language="bash"
      code={`cp node_modules/lithent/dist/lithent-agent-addon.md CLAUDE.md`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Claude Code는 프로젝트 루트의 <code>CLAUDE.md</code> 파일을 자동으로
      로드합니다. 또한 프롬프트에서 스킬 파일을 직접 참조할 수도 있습니다:
    </p>

    <CodeBlock
      language="bash"
      code={`# 채팅에서 참조
@node_modules/lithent/dist/skills/lithent/SKILL.md`}
    />

    <div class="border-l-4 border-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent dark:from-blue-500/10 dark:to-transparent p-6 my-6 rounded-r">
      <p class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
        💡 팁
      </p>
      <p class="text-xs md:text-sm text-gray-700 dark:text-gray-300">
        이미 <code>CLAUDE.md</code> 파일이 있다면, 덮어쓰지 말고 lithent 애드온
        내용을 추가하세요.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Claude.ai (웹)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      claude.ai 프로젝트의 경우, 프로젝트 지식에 스킬 파일을 추가하세요:
    </p>

    <ol class="list-decimal list-inside space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6">
      <li>Claude.ai 프로젝트 설정 열기</li>
      <li>"Project knowledge"로 이동</li>
      <li>
        <code>node_modules/lithent/dist/skills/lithent/SKILL.md</code> 업로드
      </li>
      <li>
        <code>node_modules/lithent/dist/lithent-agent-addon.md</code> 업로드
      </li>
    </ol>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      폴더 업로드가 가능하다면
      <code>node_modules/lithent/dist/skills/lithent/</code> 전체를 추가해 하위 가이드를
      모두 포함하세요. 또는 내용을 복사하여 커스텀 지침에 붙여넣을 수도
      있습니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Cursor
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      <code>.cursorrules</code> 파일을 사용하여 Cursor에 Lithent 가이드를
      추가하세요:
    </p>

    <CodeBlock
      language="bash"
      code={`# 프로젝트 루트에서
cat node_modules/lithent/dist/lithent-agent-addon.md >> .cursorrules`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      또는 <code>.cursor/rules/</code> 디렉토리를 생성하세요:
    </p>

    <CodeBlock
      language="bash"
      code={`mkdir -p .cursor/rules
cp node_modules/lithent/dist/lithent-agent-addon.md .cursor/rules/lithent.md`}
    />

    <div class="border-l-4 border-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent dark:from-blue-500/10 dark:to-transparent p-6 my-6 rounded-r">
      <p class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
        💡 채팅에서 참조
      </p>
      <p class="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-2">
        Cursor 채팅에서 스킬 파일을 직접 참조할 수도 있습니다:
      </p>
      <code class="text-xs">@node_modules/lithent/dist/skills/lithent/SKILL.md</code>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      GitHub Copilot
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      GitHub Copilot용 Lithent 지침을 추가하세요:
    </p>

    <CodeBlock
      language="bash"
      code={`mkdir -p .github
cp node_modules/lithent/dist/lithent-agent-addon.md .github/copilot-instructions.md`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      이미 copilot 지침이 있다면, 기존 파일에 추가하세요:
    </p>

    <CodeBlock
      language="bash"
      code={`cat node_modules/lithent/dist/lithent-agent-addon.md >> .github/copilot-instructions.md`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Windsurf
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Windsurf는 Cursor와 유사한 프로젝트 레벨 규칙을 지원합니다:
    </p>

    <CodeBlock
      language="bash"
      code={`cat node_modules/lithent/dist/lithent-agent-addon.md >> .windsurfrules`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      기타 AI 어시스턴트
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      다른 AI 코딩 도구의 경우, 일반적으로 다음과 같이 사용할 수 있습니다:
    </p>

    <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6">
      <li>SKILL.md와 관련 가이드 내용을 복사</li>
      <li>커스텀 지침이나 프로젝트 설정에 붙여넣기</li>
      <li>필요할 때 프롬프트에서 파일 참조</li>
    </ul>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      파일 위치
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Lithent를 설치한 후, 다음 위치에서 스킬 파일을 찾을 수 있습니다:
    </p>

    <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-6">
      <ul class="space-y-2 text-sm font-mono text-gray-700 dark:text-gray-300">
        <li>📁 node_modules/lithent/dist/skills/lithent/</li>
        <li>📄 node_modules/lithent/dist/lithent-agent-addon.md</li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      에이전트가 하는 일
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      스킬 파일이 로드되면, AI 에이전트는 다음과 같은 작업을 수행합니다:
    </p>

    <div class="grid gap-4 mb-6">
      <div class="flex items-start space-x-3">
        <svg
          class="w-5 h-5 text-[#42b883] mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <div>
          <p class="text-sm md:text-base font-medium text-gray-900 dark:text-white">
            적절한 컴포넌트 모드 제안
          </p>
          <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            필요에 따라 <code>mount</code> 또는 <code>lmount</code> 추천
          </p>
        </div>
      </div>

      <div class="flex items-start space-x-3">
        <svg
          class="w-5 h-5 text-[#42b883] mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <div>
          <p class="text-sm md:text-base font-medium text-gray-900 dark:text-white">
            흔한 실수 감지
          </p>
          <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            누락된 <code>key</code> prop, 모드 불일치, 구조적 문제 감지
          </p>
        </div>
      </div>

      <div class="flex items-start space-x-3">
        <svg
          class="w-5 h-5 text-[#42b883] mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <div>
          <p class="text-sm md:text-base font-medium text-gray-900 dark:text-white">
            Lithent 패턴 준수
          </p>
          <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            적절한 mounter/updater 구조 및 라이프사이클 훅 사용
          </p>
        </div>
      </div>

      <div class="flex items-start space-x-3">
        <svg
          class="w-5 h-5 text-[#42b883] mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <div>
          <p class="text-sm md:text-base font-medium text-gray-900 dark:text-white">
            더 나은 자동완성 제공
          </p>
          <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Lithent 관용구와 모범 사례를 따르는 코드 생성
          </p>
        </div>
      </div>
    </div>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 my-8 rounded-r">
      <p class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
        🎯 스마트 활성화
      </p>
      <p class="text-xs md:text-sm text-gray-700 dark:text-gray-300">
        에이전트 애드온은 Lithent가 프로젝트에 설치되어 있을 때만 자동으로
        활성화됩니다. Lithent가 아닌 코드베이스에는 간섭하지 않습니다.
      </p>
    </div>
  </div>
);
