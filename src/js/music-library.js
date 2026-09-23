/* Track metadata and library markup. Loaded before music-player.js in every
   music bundle; this explicit API never owns audio or playback state. */
const PortfolioMusicLibrary = (function () {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function sortDate(track) {
    const value = track.dataset.year || '';
    if (/^\d{4}(-\d{2}-\d{2})?$/.test(value)) return value;
    return '0000';
  }

  function trackYear(track) {
    const match = (track.dataset.year || '').match(/^(\d{4})/);
    return match ? match[1] : 'Date unknown';
  }

  function hasExactDate(track) {
    return /^\d{4}-\d{2}-\d{2}$/.test(track.dataset.year || '');
  }

  function visibleDate(track) {
    const match = (track.dataset.year || '').match(/^\d{4}-(\d{2})-(\d{2})$/);
    if (!match) return '';
    return (match[2] + ' ' + (MONTHS[Number(match[1]) - 1] || '')).trim();
  }

  function accessibleDate(track) {
    const value = track.dataset.year || '';
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return value || 'date unknown';
    return (Number(match[3]) + ' ' + (MONTHS[Number(match[2]) - 1] || '') + ' ' + match[1]).trim();
  }

  function isSketch(track) {
    return track.dataset.kind === 'sketch';
  }

  function kindLabel(track) {
    return isSketch(track) ? 'Sketch' : 'Finished';
  }

  function rowDetail(track, filter) {
    const parts = [];
    if (filter === 'all') parts.push(kindLabel(track));
    if (hasExactDate(track)) parts.push(visibleDate(track));
    return parts.join(' \u00b7 ');
  }

  function trackDetail(track) {
    const date = hasExactDate(track) ? accessibleDate(track) : trackYear(track);
    return kindLabel(track) + ' · ' + date;
  }

  // Catalogue titles stay the key for selection, saved state and the lock
  // screen; the optional name and note are what a listener reads.
  function displayName(track) {
    return track.dataset.name || track.dataset.title || 'Untitled track';
  }

  function displayNote(track) {
    return track.dataset.note || '';
  }

  function rowArtStyle(track) {
    if (track.dataset.thumb) return 'url("' + track.dataset.thumb.replace(/"/g, '%22') + '")';
    return track.dataset.gradient || '';
  }

  function createTrackButton(track, className) {
    const button = document.createElement('button');
    const title = track.dataset.title || 'Untitled track';
    button.className = className;
    button.type = 'button';
    button.dataset.catalogTrack = title;
    button.dataset.kind = isSketch(track) ? 'sketch' : 'release';
    button.setAttribute('aria-label', 'Play ' + title + ', ' + accessibleDate(track) + ', ' + kindLabel(track));
    button.setAttribute('aria-controls', 'playerBar');
    button.setAttribute('aria-pressed', 'false');
    return button;
  }

  function createTrackArt(track, className) {
    const art = document.createElement('span');
    art.className = className;
    art.setAttribute('aria-hidden', 'true');
    art.style.backgroundImage = rowArtStyle(track);
    return art;
  }

  function createPlayLabel(className) {
    const state = document.createElement('span');
    state.className = className;
    state.textContent = 'Play';
    state.setAttribute('aria-hidden', 'true');
    return state;
  }

  function sketchesByYear(entries) {
    const years = new Map();
    entries.forEach(track => {
      const year = trackYear(track);
      if (!years.has(year)) years.set(year, []);
      years.get(year).push(track);
    });
    return years;
  }

  function sketchDate(track, year) {
    // A track with only a known year already sits under a heading that
    // prints that year, so the cell stays empty instead of repeating it.
    if (hasExactDate(track)) return visibleDate(track);
    return trackYear(track) === year ? '' : trackYear(track);
  }

  // ------------------------------------------------------ spines and notebook
  // The published page (#musicLibrary data-layout="spines") shows no cover
  // art: finished pieces stand on a shelf spine out, sketches are a notebook
  // with one column per year. Nothing here reads artwork, so the archive
  // requests no images. Every row carries a three-bar level meter that
  // music-visualizer.js feeds while that row plays.

  function textSpan(className, text) {
    const node = document.createElement('span');
    node.className = className;
    node.textContent = text;
    return node;
  }

  function levelMeter() {
    const meter = textSpan('vu', '');
    meter.setAttribute('aria-hidden', 'true');
    meter.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
    return meter;
  }

  function namedButton(track, className) {
    const button = createTrackButton(track, className);
    const name = [displayName(track), displayNote(track)].filter(Boolean).join(', ');
    button.setAttribute('aria-label', 'Play ' + name + ', ' + accessibleDate(track) + ', ' + kindLabel(track));
    return button;
  }

  function groupHead(level, title, meta, id) {
    const head = document.createElement('header');
    head.className = 'library-group__head';
    const heading = document.createElement(level);
    heading.textContent = title;
    if (id) heading.id = id;
    head.append(heading);
    if (meta) {
      const line = document.createElement('p');
      line.textContent = meta;
      head.append(line);
    }
    return head;
  }

  function buildSpines(library, releases, sketchEntries) {
    const rows = [];

    if (releases.length) {
      const shelf = document.createElement('section');
      shelf.className = 'library-group library-group--shelf';
      const head = groupHead('h3', 'Finished');
      // The page's Spotify link is about the finished pieces, so it moves
      // into their header; without JavaScript it stays under the index.
      const spotify = document.querySelector('.library__spotify');
      if (spotify) head.append(spotify);

      const list = document.createElement('ol');
      list.className = 'library-shelf';
      releases.forEach(track => {
        const item = document.createElement('li');
        const button = namedButton(track, 'spine');
        const text = textSpan('spine__text', '');
        text.append(textSpan('spine__title', displayName(track)));
        if (displayNote(track)) text.append(textSpan('spine__note', displayNote(track)));
        button.append(textSpan('spine__year', trackYear(track)), text,
          textSpan('spine__time', track.dataset.duration || ''), levelMeter());
        item.append(button);
        list.append(item);
        rows.push(button);
      });
      shelf.append(head, list);
      library.append(shelf);
    }

    const years = sketchesByYear(sketchEntries);
    if (years.size) {
      const book = document.createElement('section');
      book.className = 'library-sketchbook';
      book.setAttribute('aria-labelledby', 'sketches-title');
      const head = groupHead('h3', 'Sketches', '', 'sketches-title');
      const columns = document.createElement('div');
      columns.className = 'library-sketchbook__years';

      years.forEach((entries, year) => {
        const group = document.createElement('section');
        group.className = 'library-group';
        group.dataset.year = year;
        const list = document.createElement('ol');
        list.className = 'library-group__list';
        entries.forEach(track => {
          const item = document.createElement('li');
          const button = namedButton(track, 'sketch-row');
          const date = document.createElement('time');
          date.className = 'sketch-row__date';
          date.dateTime = track.dataset.year || '';
          date.textContent = sketchDate(track, year);
          const name = textSpan('sketch-row__name', displayName(track));
          if (displayNote(track)) name.append(textSpan('sketch-row__note', displayNote(track)));
          button.append(date, name, textSpan('sketch-row__time', track.dataset.duration || ''), levelMeter());
          item.append(button);
          list.append(item);
          rows.push(button);
        });
        group.append(groupHead('h4', year, entries.length + (entries.length === 1 ? ' sketch' : ' sketches')), list);
        columns.append(group);
      });
      book.append(head, columns);
      library.append(book);
    }
    return rows;
  }

  // ------------------------------------------------------------------ build

  function buildLibrary(library, tracks, activeFilter) {
    if (!library) return [];
    // The build injects a plain-text track index for crawlers and no-JS
    // visitors; the interactive library replaces it.
    const staticIndex = document.getElementById('musicStaticIndex');
    if (staticIndex) staticIndex.remove();

    const releases = [];
    const sketchEntries = [];
    tracks.forEach(track => {
      (isSketch(track) ? sketchEntries : releases).push(track);
    });
    if (library.dataset.layout === 'spines') return buildSpines(library, releases, sketchEntries);

    const rows = [];

    // Review layouts: finished pieces come as a shelf of covers and the
    // sketches stay a dated ledger below rather than a wall of gradients.
    if (releases.length) {
      const shelf = document.createElement('section');
      shelf.className = 'library-group library-group--shelf';

      const heading = document.createElement('header');
      heading.className = 'library-group__head';
      const title = document.createElement('h3');
      title.textContent = 'Finished';
      const meta = document.createElement('p');
      meta.textContent = releases.length + ' pieces · newest first';
      heading.append(title, meta);

      const grid = document.createElement('ol');
      grid.className = 'library-shelf';

      releases.forEach(track => {
        const item = document.createElement('li');
        const trackTitle = track.dataset.title || 'Untitled track';
        const button = createTrackButton(track, 'shelf-tile');
        const art = createTrackArt(track, 'shelf-tile__art');

        // Carries the library-row class as well so setPlayState finds it
        // with the same selector it uses for ledger rows.
        const state = createPlayLabel('library-row__state shelf-tile__state');

        const name = document.createElement('span');
        name.className = 'shelf-tile__name';
        name.textContent = trackTitle;

        const tileMeta = document.createElement('span');
        tileMeta.className = 'shelf-tile__meta';
        tileMeta.textContent = trackYear(track) + ' · ' + (track.dataset.duration || '');

        button.append(art, state, name, tileMeta);
        item.append(button);
        grid.append(item);
        rows.push(button);
      });

      shelf.append(heading, grid);
      library.append(shelf);
    }

    sketchesByYear(sketchEntries).forEach((entries, year) => {
      const group = document.createElement('section');
      group.className = 'library-group';
      group.dataset.year = year;

      const heading = document.createElement('header');
      heading.className = 'library-group__head';
      const title = document.createElement('h3');
      title.textContent = year;
      const meta = document.createElement('p');
      // Every ledger entry is a sketch; finished pieces live on the shelf above.
      meta.textContent = entries.length + (entries.length === 1 ? ' sketch' : ' sketches');
      heading.append(title, meta);

      const list = document.createElement('ol');
      list.className = 'library-group__list';

      entries.forEach(track => {
        const item = document.createElement('li');
        const trackTitle = track.dataset.title || 'Untitled track';
        const button = createTrackButton(track, 'library-row');
        const art = createTrackArt(track, 'library-row__art');

        const main = document.createElement('span');
        main.className = 'library-row__main';
        const name = document.createElement('span');
        name.className = 'library-row__name';
        name.textContent = trackTitle;

        const detail = document.createElement('span');
        detail.className = 'library-row__detail';
        detail.textContent = rowDetail(track, activeFilter);
        main.append(name, detail);

        const date = document.createElement('time');
        date.className = 'library-row__date';
        date.dateTime = track.dataset.year || '';
        date.textContent = sketchDate(track, year);

        const duration = document.createElement('span');
        duration.className = 'library-row__duration';
        duration.textContent = track.dataset.duration || '';

        const state = createPlayLabel('library-row__state');

        button.append(art, main, date, duration, state);
        item.append(button);
        list.append(item);
        rows.push(button);
      });

      group.append(heading, list);
      library.append(group);
    });
    return rows;
  }

  return Object.freeze({
    sortDate, trackYear, isSketch, kindLabel, rowDetail, trackDetail, rowArtStyle,
    displayName, displayNote,
    build: buildLibrary
  });
})();
