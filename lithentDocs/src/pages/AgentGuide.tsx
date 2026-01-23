import { CodeBlock } from '@/components/CodeBlock';

export const AgentGuide = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      AI Agent Guide
    </h1>

    <div class="border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-500/5 to-transparent dark:from-yellow-500/10 dark:to-transparent p-6 mb-6 rounded-r">
      <p class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
        ⚠️ Experimental Feature
      </p>
      <p class="text-xs md:text-sm text-gray-700 dark:text-gray-300">
        AI agent integration is experimental. Platform-specific setup
        instructions may vary or become outdated as AI tools evolve. Please
        refer to your AI assistant's official documentation for the most
        accurate guidance.
      </p>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent provides AI agent skills files to enhance your development
      experience with AI coding assistants. These files help AI agents
      understand Lithent patterns, suggest better code, and catch common
      mistakes.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      What's included
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent ships with a skills bundle and an agent addon file:
    </p>

    <div class="grid md:grid-cols-2 gap-6 mb-8">
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800/50">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          lithent-skills/
        </h4>
        <p class="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-3">
          Folder-based skills bundle with a self-contained SKILL.md
        </p>
        <ul class="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <li>• Component patterns (mount/lmount)</li>
          <li>• State management</li>
          <li>• Lifecycle hooks</li>
          <li>• Import references</li>
        </ul>
      </div>

      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800/50">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          lithent-agent-addon.md
        </h4>
        <p class="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-3">
          Behavioral guidelines for AI agents to follow Lithent best practices
        </p>
        <ul class="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <li>• Coding guidelines</li>
          <li>• Common mistakes to catch</li>
          <li>• Pattern suggestions</li>
          <li>• Auto-activation rules</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Platform Setup
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Choose your AI coding assistant to get started:
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-8 mb-4">
      Claude Code (CLI)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Add the agent addon file to your project root as <code>CLAUDE.md</code>:
    </p>

    <CodeBlock
      language="bash"
      code={`cp node_modules/lithent/dist/lithent-agent-addon.md CLAUDE.md`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Claude Code automatically loads <code>CLAUDE.md</code> files from your
      project root. You can also reference the skills file directly in your
      prompts:
    </p>

    <CodeBlock
      language="bash"
      code={`# Reference in chat
@node_modules/lithent/dist/lithent-skills/SKILL.md`}
    />

    <div class="border-l-4 border-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent dark:from-blue-500/10 dark:to-transparent p-6 my-6 rounded-r">
      <p class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
        💡 Tip
      </p>
      <p class="text-xs md:text-sm text-gray-700 dark:text-gray-300">
        If you already have a <code>CLAUDE.md</code> file, append the lithent
        addon content to it instead of overwriting.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Claude.ai (Web)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      For claude.ai Projects, add the skills files to your project knowledge:
    </p>

    <ol class="list-decimal list-inside space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6">
      <li>Open your Claude.ai Project settings</li>
      <li>Navigate to "Project knowledge"</li>
      <li>
        Upload <code>node_modules/lithent/dist/lithent-skills/SKILL.md</code>
      </li>
      <li>
        Upload <code>node_modules/lithent/dist/lithent-agent-addon.md</code>
      </li>
    </ol>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      If folder uploads are supported, include the full
      <code>node_modules/lithent/dist/lithent-skills/</code> directory for all
      sub-guides. Alternatively, copy the content and paste it into custom
      instructions.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Cursor
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Add Lithent guidance to Cursor using <code>.cursorrules</code> file:
    </p>

    <CodeBlock
      language="bash"
      code={`# In your project root
cat node_modules/lithent/dist/lithent-agent-addon.md >> .cursorrules`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Or create <code>.cursor/rules/</code> directory:
    </p>

    <CodeBlock
      language="bash"
      code={`mkdir -p .cursor/rules
cp node_modules/lithent/dist/lithent-agent-addon.md .cursor/rules/lithent.md`}
    />

    <div class="border-l-4 border-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent dark:from-blue-500/10 dark:to-transparent p-6 my-6 rounded-r">
      <p class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
        💡 Reference in chat
      </p>
      <p class="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-2">
        You can also reference the skills file directly in Cursor chat with:
      </p>
      <code class="text-xs">@node_modules/lithent/dist/lithent-skills/SKILL.md</code>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      GitHub Copilot
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Add Lithent instructions for GitHub Copilot:
    </p>

    <CodeBlock
      language="bash"
      code={`mkdir -p .github
cp node_modules/lithent/dist/lithent-agent-addon.md .github/copilot-instructions.md`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      If you already have copilot instructions, append to the existing file:
    </p>

    <CodeBlock
      language="bash"
      code={`cat node_modules/lithent/dist/lithent-agent-addon.md >> .github/copilot-instructions.md`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Windsurf
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Windsurf supports project-level rules similar to Cursor:
    </p>

    <CodeBlock
      language="bash"
      code={`cat node_modules/lithent/dist/lithent-agent-addon.md >> .windsurfrules`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Other AI Assistants
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      For other AI coding tools, you can typically:
    </p>

    <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6">
      <li>Copy the content from SKILL.md and related guides</li>
      <li>Paste into custom instructions or project settings</li>
      <li>Reference the files in your prompts when needed</li>
    </ul>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      File Locations
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      After installing Lithent, you can find the skills files at:
    </p>

    <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-6">
      <ul class="space-y-2 text-sm font-mono text-gray-700 dark:text-gray-300">
        <li>📁 node_modules/lithent/dist/lithent-skills/</li>
        <li>📄 node_modules/lithent/dist/lithent-agent-addon.md</li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What the agent will do
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      With the skills files loaded, AI agents will:
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
            Suggest the right component mode
          </p>
          <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Recommend <code>mount</code> vs <code>lmount</code> based on your
            needs
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
            Catch common mistakes
          </p>
          <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Detect missing <code>key</code> props, mode inconsistencies, and
            structural issues
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
            Follow Lithent patterns
          </p>
          <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Use proper mounter/updater structure and lifecycle hooks
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
            Provide better completions
          </p>
          <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Generate code that follows Lithent idioms and best practices
          </p>
        </div>
      </div>
    </div>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 my-8 rounded-r">
      <p class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
        🎯 Smart Activation
      </p>
      <p class="text-xs md:text-sm text-gray-700 dark:text-gray-300">
        The agent addon automatically activates only when Lithent is installed
        in your project. It won't interfere with non-Lithent codebases.
      </p>
    </div>
  </div>
);
