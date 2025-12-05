import { mount, mountCallback, portal, ref } from 'lithent';
import { state } from 'lithent/helper';

interface Message {
  id: number;
  text: string;
  timestamp: Date;
}

interface PortalZone {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  position: string;
}

const portalZones: PortalZone[] = [
  {
    id: 'fire',
    name: '불의 차원',
    icon: '🔥',
    color: 'text-red-500',
    gradient: 'from-red-500 to-orange-500',
    position: 'top-0 left-1/2 -translate-x-1/2',
  },
  {
    id: 'water',
    name: '물의 차원',
    icon: '💧',
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
    position: 'bottom-0 left-1/2 -translate-x-1/2',
  },
];

// 포탈 메시지 컴포넌트
const PortalMessage = mount<{
  message: Message;
  aa: any;
  color: string;
  key?: any;
}>((_r, props) => {
  return () => (
    <div
      class={`message-item p-2 mb-2 rounded-lg bg-gray-800 border-l-4 border-${props.color} animate-fadeIn`}
      aa={props.aa}
    >
      <p class="text-sm text-white">{props.message.text}</p>
      <span class="text-xs text-gray-400">
        {props.message.timestamp.toLocaleTimeString()}
      </span>
    </div>
  );
});

// 포탈 목적지 컴포넌트
const PortalDestination = mount<{
  zone: PortalZone;
  elementRef: { value: HTMLElement | null };
  key?: any;
}>((_r, props) => {
  return () => (
    <div
      ref={props.elementRef}
      class={`absolute ${props.zone.position} w-48 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-lg z-20`}
    >
      <div class="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
        <span class="text-2xl">{props.zone.icon}</span>
        <h4 class={`text-sm font-bold ${props.zone.color}`}>
          {props.zone.name}
        </h4>
      </div>
      <div class="max-h-32 overflow-y-auto space-y-1">
        <p class="text-xs text-gray-500 italic">
          메시지가 이곳에 나타납니다...
        </p>
      </div>
    </div>
  );
});

export const Example20 = mount(r => {
  const messageText = state('', r);
  const selectedPortal = state('fire', r);
  const messageIdCounter = state(0, r);

  // 각 포탈의 메시지 상태
  const portalMessages = state<Record<string, Message[]>>(
    {
      fire: [],
      water: [],
    },
    r
  );

  // 각 포탈의 DOM ref
  const portalRefs: Record<string, { value: HTMLElement | null }> = {
    fire: ref(null),
    water: ref(null),
  };

  // 첫 렌더링 후 포탈 ref가 설정되면 리렌더
  mountCallback(() => {
    r();
  });

  const sendMessage = () => {
    if (!messageText.v.trim()) return;

    const newMessage: Message = {
      id: messageIdCounter.v++,
      text: messageText.v,
      timestamp: new Date(),
    };

    const currentMessages = portalMessages.v[selectedPortal.v] || [];
    portalMessages.v = {
      ...portalMessages.v,
      [selectedPortal.v]: [...currentMessages, newMessage],
    };

    messageText.v = '';
  };

  const clearPortal = (portalId: string) => {
    portalMessages.v = {
      ...portalMessages.v,
      [portalId]: [],
    };
  };

  return () => {
    const selectedZone = portalZones.find(z => z.id === selectedPortal.v)!;

    return (
      <div class="w-full max-w-5xl mx-auto">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            🌀 마법 포탈 메신저
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Portal을 사용하여 메시지를 다른 DOM 위치로 전송하세요!
          </p>
        </div>

        {/* 포탈 영역 컨테이너 */}
        <div class="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 min-h-[500px] border border-gray-700">
          {/* 각 포탈 목적지 렌더링 */}
          {portalZones.map(zone => (
            <PortalDestination
              key={zone.id}
              zone={zone}
              elementRef={portalRefs[zone.id]}
            />
          ))}

          {/* 중앙 제어판 */}
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl p-4 z-10">
            <div class="flex items-center justify-center gap-2 mb-4 pb-3 border-b border-gray-600">
              <span class="text-2xl">✨</span>
              <h4 class="text-base font-bold text-white">메시지 전송</h4>
            </div>

            {/* 포탈 선택 */}
            <div class="mb-3">
              <label class="block text-xs font-medium text-gray-300 mb-2">
                전송할 포탈 선택:
              </label>
              <div class="flex gap-2">
                {portalZones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => (selectedPortal.v = zone.id)}
                    class={`flex-1 p-2 rounded-lg border-2 transition-all ${
                      selectedPortal.v === zone.id
                        ? `border-${zone.color} bg-gradient-to-r ${zone.gradient} text-white`
                        : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span class="text-lg">{zone.icon}</span>
                    <span class="text-xs block mt-1">{zone.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 메시지 입력 */}
            <div class="mb-3">
              <label class="block text-xs font-medium text-gray-300 mb-2">
                메시지:
              </label>
              <textarea
                value={messageText.v}
                onInput={(e: Event) =>
                  (messageText.v = (e.target as HTMLTextAreaElement).value)
                }
                onKeyPress={(e: KeyboardEvent) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="메시지를 입력하세요..."
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                rows={3}
              />
            </div>

            {/* 전송 버튼 */}
            <button
              onClick={sendMessage}
              class={`w-full px-4 py-2 rounded-lg font-medium text-white transition-all bg-gradient-to-r ${selectedZone.gradient} hover:opacity-90 shadow-lg`}
            >
              {selectedZone.icon} {selectedZone.name}으로 전송
            </button>
          </div>

          {/* Portal을 통해 각 목적지에 메시지 렌더링 */}
          {portalZones.map(zone => {
            const portalRef = portalRefs[zone.id];
            const messages = portalMessages.v[zone.id] || [];

            return portalRef.value && messages.length > 0
              ? portal(
                  <div key={zone.id} class="space-y-1">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-xs text-gray-400">
                        {messages.length}개 메시지
                      </span>
                      <button
                        onClick={() => clearPortal(zone.id)}
                        class="text-xs text-red-400 hover:text-red-300"
                      >
                        지우기
                      </button>
                    </div>
                    {messages.slice(-3).map(msg => (
                      <PortalMessage
                        key={msg.id}
                        aa={msg.id}
                        message={msg}
                        color={zone.color}
                      />
                    ))}
                  </div>,
                  portalRef.value as HTMLElement
                )
              : null;
          })}
        </div>

        {/* 설명 */}
        <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p class="text-xs text-blue-800 dark:text-blue-200 mb-2">
            💡 <strong>Portal의 핵심 특성:</strong>
          </p>
          <ol class="text-xs text-blue-700 dark:text-blue-300 ml-4 space-y-1">
            <li>
              1. 메시지는 <strong>중앙 제어판</strong>에서 생성되지만, 선택한{' '}
              <strong>포탈 영역</strong>에 렌더링됩니다
            </li>
            <li>
              2. 각 포탈은 <strong>독립적인 DOM 위치</strong>를 가지지만, 상태는{' '}
              <strong>부모 컴포넌트</strong>가 관리합니다
            </li>
            <li>
              3. 포탈 내부의 컴포넌트는 <strong>이벤트와 생명주기</strong>를
              부모와 공유합니다
            </li>
          </ol>
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  };
});
