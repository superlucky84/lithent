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

const NotificationItem = mount<{
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
          title={n.read ? 'Mark as unread' : 'Mark as read'}
        />
      </div>
    );
  };
});

export const Example5 = mount(r => {
  const notifications = state<Notification[]>(
    [
      {
        id: 1,
        type: 'like',
        user: 'Sarah',
        content: 'liked your post',
        time: '2 min ago',
        read: false,
      },
      {
        id: 2,
        type: 'comment',
        user: 'John',
        content: 'commented: "Great work!"',
        time: '5 min ago',
        read: false,
      },
      {
        id: 3,
        type: 'like',
        user: 'Mike',
        content: 'liked your comment',
        time: '10 min ago',
        read: true,
      },
      {
        id: 4,
        type: 'follow',
        user: 'Emma',
        content: 'started following you',
        time: '15 min ago',
        read: false,
      },
      {
        id: 5,
        type: 'comment',
        user: 'Alex',
        content: 'replied to your comment',
        time: '20 min ago',
        read: true,
      },
      {
        id: 6,
        type: 'system',
        content: 'Your profile was viewed 25 times this week',
        time: '1 hour ago',
        read: true,
      },
      {
        id: 7,
        type: 'follow',
        user: 'Lisa',
        content: 'started following you',
        time: '2 hours ago',
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
            Notifications
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
              Mark all as read
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
            ❤️ Likes ({likes.length})
          </button>
          <button
            onClick={() => toggleFilter('comment')}
            class={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filters.v.comment
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            💬 Comments ({comments.length})
          </button>
          <button
            onClick={() => toggleFilter('follow')}
            class={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filters.v.follow
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            👤 Follows ({follows.length})
          </button>
          <button
            onClick={() => toggleFilter('system')}
            class={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filters.v.system
                ? 'bg-gray-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            🔔 System ({systems.length})
          </button>
        </div>

        {/* Notifications List with Nested Fragments */}
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <Fragment>
            {/* Likes Fragment Group */}
            {filters.v.like && (
              <Fragment>
                {likes.map(notification => (
                  <NotificationItem
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
                  <NotificationItem
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
                    <NotificationItem
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
                    <NotificationItem
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
                <p class="text-sm">No filters selected</p>
              </div>
            )}
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400 mt-4">
          This example uses nested Fragments to group notifications by type.
          Toggling the filters adds or removes DOM at Fragment boundaries.
        </p>
      </div>
    );
  };
});
