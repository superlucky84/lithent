/* Cat widget playground for lithent/element.
 *
 * Two halves on purpose:
 * - the WIDGET part only uses lithent and lithent/element;
 * - the PAGE part only uses attributes, properties and DOM events, the way a
 *   host site that has never heard of lithent would.
 * Globals: window.lithent (core UMD), window.lithentElement (element UMD).
 */
(() => {
  const { h, mount, mountCallback } = window.lithent;
  const { defineElement, emit } = window.lithentElement;

  // ---------------------------------------------------------------- WIDGET --

  const catStyles = `
    :host { display: block; font-family: system-ui, -apple-system, 'Apple SD Gothic Neo', sans-serif; color: #2a2f3d; }
    .card { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 12px; padding: 14px;
      border-radius: 14px; background: #ffffff; border: 1px solid #e3e6ee; box-shadow: 0 1px 2px rgb(0 0 0 / 6%); }
    .card.sleepy { background: #f4f2ff; }
    .avatar { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center;
      font-size: 34px; background: var(--cat-color, #f4b860); }
    h3 { margin: 0; font-size: 18px; }
    p { margin: 2px 0; font-size: 13.5px; }
    .mood { font-weight: 600; }
    .meter { height: 8px; border-radius: 99px; background: #eceef4; overflow: hidden; margin: 6px 0; }
    .meter span { display: block; height: 100%; background: linear-gradient(90deg, #6cc59a, #f2a33a 60%, #e2557a); }
    .toys, .caption { color: #5b6275; }
    .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 6px; }
    button { font: inherit; font-size: 13.5px; padding: 5px 12px; border-radius: 8px;
      border: 1px solid #c9cfdd; background: #f7f8fb; color: #2a2f3d; cursor: pointer; }
    button:focus-visible { outline: 2px solid #2b8a5e; outline-offset: 2px; }
    .pets { font-variant-numeric: tabular-nums; font-size: 13px; }
    .meta { font-size: 11.5px; color: #8a90a2; font-family: ui-monospace, Menlo, monospace; }
  `;

  /** The cat card: closure state (pets, renders) plus declared props. */
  const CatCard = mount((renew, props) => {
    let pets = 0;
    let renders = 0;
    let blocked = false;

    // Lifecycle is reported as DOM events: the widget does not know the page.
    mountCallback(() => {
      emit(props.host, 'lifecycle', { type: 'mount', name: props.name });
      return () =>
        emit(props.host, 'lifecycle', { type: 'unmount', name: props.name });
    });

    const pet = () => {
      pets += 1;
      // false when the page called preventDefault()
      blocked = !emit(props.host, 'meow', { name: props.name, pets });
      renew();
    };

    return () => {
      renders += 1;
      const hunger = props.hunger ?? 50;
      const toys = Array.isArray(props.toys) ? props.toys : [];
      const mood = props.sleepy
        ? '😴 꾸벅꾸벅'
        : hunger >= 70
          ? '😿 배고파요'
          : hunger <= 20
            ? '😻 배불러요'
            : '😺 기분 좋아요';
      const face = blocked ? '😾' : props.sleepy ? '😴' : '🐱';

      return h(
        'article',
        { part: 'card', class: props.sleepy ? 'card sleepy' : 'card' },
        h('div', { class: 'avatar', 'aria-hidden': 'true' }, face),
        h(
          'div',
          {},
          h('h3', {}, props.name || '이름 없는 고양이'),
          h('p', { class: 'mood' }, mood),
          h(
            'div',
            { class: 'meter', title: `배고픔 ${hunger}` },
            h('span', { style: { width: `${hunger}%` } })
          ),
          h(
            'p',
            { class: 'toys' },
            toys.length ? `장난감: ${toys.join(', ')}` : '장난감 없음'
          ),
          h(
            'p',
            { class: 'caption' },
            h('slot', { name: 'caption' }, '(캡션 없음)')
          ),
          h(
            'div',
            { class: 'row' },
            h(
              'button',
              { part: 'pet-button', type: 'button', onClick: pet },
              '쓰다듬기 🖐️'
            ),
            h('span', { class: 'pets' }, `쓰다듬은 횟수 ${pets}`)
          ),
          h(
            'p',
            { class: 'meta' },
            `렌더 #${renders}` + (blocked ? ' · 냐옹이 막혔어요' : '')
          )
        )
      );
    };
  });

  /** A light-DOM widget for comparison: page CSS reaches it. */
  const Sticker = mount(
    (_renew, props) => () => h('p', {}, `🏷️ ${props.label || '스티커'}`)
  );

  const registerWidgets = () => {
    defineElement('cat-card', CatCard, {
      props: { name: String, hunger: Number, sleepy: Boolean, toys: Object },
      styles: [catStyles],
    });
    defineElement('cat-sticker', Sticker, {
      props: { label: String },
      shadow: false,
    });
  };

  // ------------------------------------------------------------------ PAGE --

  const $ = selector => document.querySelector(selector);
  const nabi = $('#nabi');
  const momo = $('#momo');
  const living = $('#living');
  const bedroom = $('#bedroom');
  const logList = $('#log');

  const log = (kind, text) => {
    const li = document.createElement('li');
    li.className = `k-${kind}`;
    const time = document.createElement('time');
    time.textContent = new Date().toTimeString().slice(0, 8);
    const span = document.createElement('span');
    span.textContent = text;
    li.append(time, span);
    logList.prepend(li);
  };

  const verdict = (id, ok, text) => {
    const el = $(id);
    el.className = `verdict ${ok ? 'ok' : 'bad'}`;
    el.textContent = `${ok ? '✅' : '❌'} ${text}`;
  };

  /** Reads what the widget shows; the cats use open shadow roots. */
  const read = (cat, selector) =>
    cat.shadowRoot?.querySelector(selector)?.textContent ?? '';
  const renderNo = cat => Number(read(cat, '.meta').match(/#(\d+)/)?.[1] ?? 0);
  const petCount = cat => Number(read(cat, '.pets').match(/\d+/)?.[0] ?? 0);
  const nextTask = () => new Promise(resolve => setTimeout(resolve, 0));
  const lifecycleSince = mark =>
    lifecycleEvents.slice(mark).map(e => `${e.type} ${e.name}`);

  const lifecycleEvents = [];
  for (const cat of [nabi, momo]) {
    cat.addEventListener('lifecycle', e => {
      lifecycleEvents.push(e.detail);
      log('life', `${e.detail.name}: ${e.detail.type}`);
    });
    cat.addEventListener('meow', e => {
      if ($('#block-meow').checked) {
        e.preventDefault();
        log('bad', `${e.detail.name}: 냐옹 금지! (preventDefault)`);
      } else {
        log(
          'event',
          `${e.detail.name}: 냐옹! (쓰다듬은 횟수 ${e.detail.pets})`
        );
      }
    });
  }

  const showAttributes = () => {
    $('#attr-view').textContent =
      '속성 보기: <cat-card' +
      [...nabi.attributes].map(a => ` ${a.name}="${a.value}"`).join('') +
      '>';
  };
  new MutationObserver(showAttributes).observe(nabi, { attributes: true });
  showAttributes();

  // 0. Assigned before the element is defined: an own property for now.
  nabi.toys = ['털실 공'];
  log('info', '등록 전: nabi.toys = ["털실 공"] (프로퍼티)');

  // 0. Register
  $('#register').addEventListener('click', async e => {
    e.currentTarget.disabled = true;
    registerWidgets();
    log('info', 'defineElement("cat-card"), defineElement("cat-sticker")');
    document
      .querySelectorAll('.step button[disabled]')
      .forEach(button => (button.disabled = false));
    await nextTask();
    const toyKept = read(nabi, '.toys').includes('털실 공');
    const stickerReplaced = !$('#sticker').textContent.includes('서버가 그린');
    verdict(
      '#v0',
      toyKept && stickerReplaced,
      toyKept && stickerReplaced
        ? '업그레이드 완료: 미리 넣은 장난감 유지, 스티커 교체'
        : '업그레이드 확인 실패'
    );
  });

  // 1. Attributes
  $('#name-input').addEventListener('input', e =>
    nabi.setAttribute('name', e.target.value)
  );
  $('#hunger-input').addEventListener('input', e =>
    nabi.setAttribute('hunger', e.target.value)
  );
  $('#sleepy-input').addEventListener('change', e =>
    nabi.toggleAttribute('sleepy', e.target.checked)
  );

  // 2. Batched render
  $('#batch').addEventListener('click', async () => {
    const before = renderNo(nabi);
    const names = ['치즈', '까망이', '두부', '나비'];
    const next = names[(names.indexOf(nabi.getAttribute('name')) + 1) % 4];
    nabi.setAttribute('name', next);
    nabi.setAttribute('hunger', String(Math.round(Math.random() * 100)));
    nabi.toggleAttribute('sleepy');
    $('#name-input').value = next;
    $('#hunger-input').value = nabi.getAttribute('hunger');
    $('#sleepy-input').checked = nabi.hasAttribute('sleepy');
    await nextTask();
    const after = renderNo(nabi);
    verdict(
      '#v2',
      after - before === 1,
      `렌더 #${before} → #${after} (속성 3개 변경, 렌더 ${after - before}번)`
    );
  });

  // 3. Object property
  document.querySelectorAll('[data-toy]').forEach(button =>
    button.addEventListener('click', async () => {
      nabi.toys = [...(nabi.toys || []), button.dataset.toy];
      await nextTask();
      const shown = read(nabi, '.toys').includes(button.dataset.toy);
      const noAttr = !nabi.hasAttribute('toys');
      verdict(
        '#v3',
        shown && noAttr,
        `${shown ? '목록에 표시됨' : '목록에 없음'}, toys 속성 ${noAttr ? '없음' : '생김'}`
      );
    })
  );

  // 5. CSS isolation and theming
  $('#bomb').addEventListener('change', e => {
    $('#css-bomb').media = e.target.checked ? 'all' : 'not all';
    const inside = nabi.shadowRoot?.querySelector('h3');
    const outside = $('#sticker p');
    if (!inside || !outside) return;
    const insideFont = getComputedStyle(inside).fontFamily;
    const outsideFont = getComputedStyle(outside).fontFamily;
    const isolated = !/comic|chalkboard/i.test(insideFont);
    verdict(
      '#v5',
      isolated,
      e.target.checked
        ? `카드 글꼴: ${insideFont.split(',')[0]} / 스티커 글꼴: ${outsideFont.split(',')[0]}`
        : '폭탄 해제'
    );
  });
  $('#part').addEventListener('change', e => {
    $('#part-style').media = e.target.checked ? 'all' : 'not all';
  });
  $('#fur').addEventListener('input', e => {
    nabi.style.setProperty('--cat-color', e.target.value);
    momo.style.setProperty('--cat-color', e.target.value);
  });

  // 6. Slot
  $('#caption-input').addEventListener('input', e => {
    const caption = nabi.querySelector('[slot="caption"]');
    if (caption) caption.textContent = e.target.value;
  });

  // 7. Moves
  const otherRoom = () => (nabi.parentElement === living ? bedroom : living);
  const checkMove = async (how, move) => {
    const pets = petCount(nabi);
    const mark = lifecycleEvents.length;
    move();
    await nextTask();
    const kept = petCount(nabi) === pets;
    const quiet = lifecycleSince(mark).length === 0;
    verdict(
      '#v7',
      kept && quiet,
      `${how}: 쓰다듬은 횟수 ${pets} → ${petCount(nabi)}, mount/unmount ${quiet ? '없음' : lifecycleSince(mark).join(', ')}`
    );
  };
  $('#move-one').addEventListener('click', () =>
    checkMove('appendChild', () => otherRoom().appendChild(nabi))
  );
  $('#move-two').addEventListener('click', () =>
    checkMove('remove() 후 삽입', () => {
      const target = otherRoom();
      nabi.remove();
      target.appendChild(nabi);
    })
  );

  // 8. Remove and bring back
  let removedMark = 0;
  $('#remove').addEventListener('click', async () => {
    if (!nabi.isConnected) return;
    removedMark = lifecycleEvents.length;
    nabi.remove();
    await nextTask();
    const events = lifecycleSince(removedMark);
    verdict(
      '#v8',
      events.join() === `unmount ${nabi.getAttribute('name')}`,
      `내보냄: ${events.join(', ') || '이벤트 없음'}`
    );
  });
  $('#bring').addEventListener('click', async () => {
    if (nabi.isConnected) return;
    living.appendChild(nabi);
    await nextTask();
    const events = lifecycleSince(removedMark);
    const fresh = petCount(nabi) === 0;
    verdict(
      '#v8',
      events.length === 2 && events[1].startsWith('mount') && fresh,
      `다시 데려옴: ${events.join(' → ')}, 쓰다듬은 횟수 ${petCount(nabi)}`
    );
  });

  // 9. Duplicate definition
  $('#redefine').addEventListener('click', () => {
    const before = customElements.get('cat-card');
    try {
      const returned = defineElement('cat-card', Sticker);
      verdict(
        '#v9',
        returned === before,
        returned === before
          ? '오류 없음, 기존 생성자를 돌려받음'
          : '다른 생성자가 돌아옴'
      );
    } catch (error) {
      verdict('#v9', false, `예외 발생: ${error.message}`);
    }
  });

  log('info', '페이지 준비 완료. 0번부터 눌러 보세요.');
})();
