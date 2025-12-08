import { mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'system';
  user?: string;
  content: string;
  time: string;
  read: boolean;
}

const NotificationItemKo = mount<{
  notification: Notification;
  onToggleRead: () => void;
}>((_r, props) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      case 'system':
        return '🔔';
      default:
        return '📌';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'bg-pink-500';
      case 'comment':
        return 'bg-blue-500';
      case 'follow':
        return 'bg-purple-500';
      case 'system':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  return () => {
    const n = props.notification;
    return (
      <div
        class={`flex items-start gap-3 p-3 rounded-lg transition-all ${
          n.read
            ? 'bg-gray-50 dark:bg-gray-800/50'
            : 'bg-white dark:bg-gray-800 border border-[#42b883]/20'
        }`}
      >
        <div
          class={`flex-shrink-0 w-10 h-10 rounded-full ${getColor(n.type)} flex items-center justify-center text-lg`}
        >
          {getIcon(n.type)}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900 dark:text-gray-100">
            {n.user && <strong>{n.user}</strong>} {n.content}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.time}</p>
        </div>
        <button
          onClick={props.onToggleRead}
          class={`flex-shrink-0 w-3 h-3 rounded-full border-2 transition-colors ${
            n.read
              ? 'border-gray-300 dark:border-gray-600'
              : 'border-[#42b883] bg-[#42b883]'
          }`}
          title={n.read ? '읽지 않음으로 표시' : '읽음으로 표시'}
        />
      </div>
    );
  };
});

export const Example5Ko = mount(r => {
  const notifications = state<Notification[]>(
    [
      {
        id: 1,
        type: 'like',
        user: 'Sarah',
        content: '님이 게시글을 좋아합니다',
        time: '2분 전',
        read: false,
      },
      {
        id: 2,
        type: 'comment',
        user: 'John',
        content: '님이 댓글을 남겼습니다: "Great work!"',
        time: '5분 전',
        read: false,
      },
      {
        id: 3,
        type: 'like',
        user: 'Mike',
        content: '님이 댓글을 좋아합니다',
        time: '10분 전',
        read: true,
      },
      {
        id: 4,
        type: 'follow',
        user: 'Emma',
        content: '님이 팔로우를 시작했습니다',
        time: '15분 전',
        read: false,
      },
      {
        id: 5,
        type: 'comment',
        user: 'Alex',
        content: '님이 댓글에 답글을 남겼습니다',
        time: '20분 전',
        read: true,
      },
      {
        id: 6,
        type: 'system',
        content: '이번 주에 프로필이 25회 조회되었습니다',
        time: '1시간 전',
        read: true,
      },
      {
        id: 7,
        type: 'follow',
        user: 'Lisa',
        content: '님이 팔로우를 시작했습니다',
        time: '2시간 전',
        read: true,
      },
    ],
    r
  );

  const filters = state(
    {
      like: true,
      comment: true,
      follow: true,
      system: true,
    },
    r
  );

  const toggleFilter = (type: 'like' | 'comment' | 'follow' | 'system') => {
    filters.v = { ...filters.v, [type]: !filters.v[type] };
  };

  const toggleRead = (id: number) => {
    notifications.v = notifications.v.map(n =>
      n.id === id ? { ...n, read: !n.read } : n
    );
  };

  const markAllRead = () => {
    notifications.v = notifications.v.map(n => ({ ...n, read: true }));
  };

  return () => {
    const likes = notifications.v.filter(n => n.type === 'like');
    const comments = notifications.v.filter(n => n.type === 'comment');
    const follows = notifications.v.filter(n => n.type === 'follow');
    const systems = notifications.v.filter(n => n.type === 'system');
    const unreadCount = notifications.v.filter(n => !n.read).length;

    return (
      <div class="w-full max-w-2xl mx-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            알림
            {unreadCount > 0 && (
              <span class="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-[#42b883] text-white">
                {unreadCount}
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              class="text-xs text-[#42b883] hover:text-[#36996b] font-medium transition-colors"
            >
              모두 읽음으로 표시
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => toggleFilter('like')}
            class={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filters.v.like
                ? 'bg-pink-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            ❤️ 좋아요 ({likes.length})
          </button>
          <button
            onClick={() => toggleFilter('comment')}
            class={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filters.v.comment
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            💬 댓글 ({comments.length})
          </button>
          <button
            onClick={() => toggleFilter('follow')}
            class={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filters.v.follow
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            👤 팔로우 ({follows.length})
          </button>
          <button
            onClick={() => toggleFilter('system')}
            class={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filters.v.system
                ? 'bg-gray-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            🔔 시스템 ({systems.length})
          </button>
        </div>

        {/* Notifications List with Nested Fragments */}
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <Fragment>
            {/* Likes Fragment Group */}
            {filters.v.like && (
              <Fragment>
                {likes.map(notification => (
                  <NotificationItemKo
                    notification={notification}
                    onToggleRead={() => toggleRead(notification.id)}
                  />
                ))}
              </Fragment>
            )}

            {/* Comments Fragment Group */}
            {filters.v.comment && (
              <Fragment>
                {comments.map(notification => (
                  <NotificationItemKo
                    notification={notification}
                    onToggleRead={() => toggleRead(notification.id)}
                  />
                ))}
              </Fragment>
            )}

            {/* Nested Fragment for Social Activities */}
            <Fragment>
              {/* Follows Fragment Group */}
              {filters.v.follow && (
                <Fragment>
                  {follows.map(notification => (
                    <NotificationItemKo
                      notification={notification}
                      onToggleRead={() => toggleRead(notification.id)}
                    />
                  ))}
                </Fragment>
              )}

              {/* System Fragment Group (nested deeper) */}
              {filters.v.system && (
                <Fragment>
                  {systems.map(notification => (
                    <NotificationItemKo
                      notification={notification}
                      onToggleRead={() => toggleRead(notification.id)}
                    />
                  ))}
                </Fragment>
              )}
            </Fragment>
          </Fragment>

          {/* Empty State */}
          {!filters.v.like &&
            !filters.v.comment &&
            !filters.v.follow &&
            !filters.v.system && (
              <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                <p class="text-sm">선택된 필터가 없습니다</p>
              </div>
            )}
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400 mt-4">
          이 예제는 중첩된 Fragment를 사용하여 알림 타입별로 그룹화합니다.
          필터를 토글하면 Fragment 단위로 DOM이 추가/제거됩니다.
        </p>
      </div>
    );
  };
});
