import type { LabTopic } from '../lab';

export const structure: LabTopic = {
  slug: 'structure',
  title: 'Structure & semantics',
  intro: 'Content that looks structured but is not: fake headings and lists, tables without headers, vague links.',
  examples: [
    {
      id: 'heading-order',
      wcag: ['1.3.1'],
      title: 'Skipped heading levels',
      problem: 'A section heading jumps from level 2 to level 5, breaking the outline screen-reader users navigate by.',
      fix: 'Heading levels go down one step at a time.',
      Broken: () => (
        <div>
          <h5>Opening hours</h5>
          <p>Mon–Fri 9:00–18:00</p>
        </div>
      ),
      Fixed: () => (
        <div>
          <h3>Opening hours</h3>
          <p>Mon–Fri 9:00–18:00</p>
        </div>
      ),
    },
    {
      id: 'fake-heading',
      wcag: ['1.3.1'],
      title: 'Text styled as a heading',
      problem: 'Big bold text looks like a heading, but it is a <div>: it does not appear in the headings list.',
      fix: 'A real heading element.',
      Broken: () => (
        <div>
          <div className="lab-fake-heading">Shipping costs</div>
          <p>Free from CHF 100.</p>
        </div>
      ),
      Fixed: () => (
        <div>
          <h3 className="lab-fake-heading">Shipping costs</h3>
          <p>Free from CHF 100.</p>
        </div>
      ),
    },
    {
      id: 'fake-list',
      wcag: ['1.3.1'],
      title: 'List built from divs',
      problem: 'Bullet characters in separate <div>s: screen readers do not announce "list, 3 items".',
      fix: 'A <ul> with <li> items.',
      Broken: () => (
        <div>
          <div>• Waterproof</div>
          <div>• Breathable</div>
          <div>• Packable</div>
        </div>
      ),
      Fixed: () => (
        <ul>
          <li>Waterproof</li>
          <li>Breathable</li>
          <li>Packable</li>
        </ul>
      ),
    },
    {
      id: 'table-without-headers',
      wcag: ['1.3.1'],
      title: 'Data table without header cells',
      problem: 'The first row is bold <td>s, so cells are read without their column names.',
      fix: '<th scope="col"> header cells and a caption.',
      Broken: () => (
        <table className="lab-table">
          <tbody>
            <tr>
              <td>
                <b>Size</b>
              </td>
              <td>
                <b>Chest (cm)</b>
              </td>
            </tr>
            <tr>
              <td>M</td>
              <td>96–100</td>
            </tr>
            <tr>
              <td>L</td>
              <td>101–106</td>
            </tr>
          </tbody>
        </table>
      ),
      Fixed: () => (
        <table className="lab-table">
          <caption>Size guide</caption>
          <thead>
            <tr>
              <th scope="col">Size</th>
              <th scope="col">Chest (cm)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>M</td>
              <td>96–100</td>
            </tr>
            <tr>
              <td>L</td>
              <td>101–106</td>
            </tr>
          </tbody>
        </table>
      ),
    },
    {
      id: 'vague-links',
      wcag: ['2.4.4'],
      title: '"Click here" links',
      problem: 'Several links all called "click here": out of context (a links list) nobody knows where they go.',
      fix: 'Link text that says where it goes.',
      Broken: () => (
        <ul>
          <li>
            Size guide: <a href="#size">click here</a>
          </li>
          <li>
            Returns: <a href="#returns">click here</a>
          </li>
        </ul>
      ),
      Fixed: () => (
        <ul>
          <li>
            <a href="#size">Size guide</a>
          </li>
          <li>
            <a href="#returns">Returns policy</a>
          </li>
        </ul>
      ),
    },
    {
      id: 'duplicate-id',
      wcag: ['4.1.2'],
      title: 'Duplicate id referenced by ARIA',
      problem: 'Two labels share id="lab-qty-label", so the second field gets the wrong name.',
      fix: 'Unique ids.',
      Broken: () => (
        <div className="lab-field">
          <span id="lab-qty-label">Quantity (adults)</span>
          <input type="number" aria-labelledby="lab-qty-label" />
          <span id="lab-qty-label">Quantity (children)</span>
          <input type="number" aria-labelledby="lab-qty-label" />
        </div>
      ),
      Fixed: () => (
        <div className="lab-field">
          <span id="lab-qty-adults">Quantity (adults)</span>
          <input type="number" aria-labelledby="lab-qty-adults" />
          <span id="lab-qty-children">Quantity (children)</span>
          <input type="number" aria-labelledby="lab-qty-children" />
        </div>
      ),
    },
    {
      id: 'invalid-lang',
      wcag: ['3.1.2'],
      title: 'Invalid language of a part',
      problem: 'A French quote marked lang="francais" — not a valid code, so screen readers keep the English voice.',
      fix: 'lang="fr".',
      Broken: () => (
        <p>
          Our founder's motto: <q lang="francais">Petit à petit, l'oiseau fait son nid.</q>
        </p>
      ),
      Fixed: () => (
        <p>
          Our founder's motto: <q lang="fr">Petit à petit, l'oiseau fait son nid.</q>
        </p>
      ),
    },
    {
      id: 'new-window-no-warning',
      wcag: ['3.2.5'],
      title: 'New window without warning',
      problem: 'The link opens a new tab without saying so — disorienting, especially with a screen reader.',
      fix: 'The link text says "(opens in a new tab)".',
      Broken: () => (
        <a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer">
          WCAG overview
        </a>
      ),
      Fixed: () => (
        <a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer">
          WCAG overview <span className="sr-only">(opens in a new tab)</span>
          <span aria-hidden="true"> ↗</span>
        </a>
      ),
    },
  ],
};
