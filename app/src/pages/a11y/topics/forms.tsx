import type { LabTopic } from '../lab';

export const forms: LabTopic = {
  slug: 'forms',
  title: 'Forms',
  intro: 'Fields screen readers cannot name, errors nobody hears, required fields shown only with a star.',
  examples: [
    {
      id: 'missing-label',
      wcag: ['1.3.1', '4.1.2'],
      title: 'Input without a label',
      problem: 'The text "Full name" is a <span> next to the input — not connected to it.',
      fix: 'A <label> connected to the input.',
      Broken: () => (
        <div className="lab-field">
          <span>Full name</span>
          <input type="text" />
        </div>
      ),
      Fixed: () => (
        <div className="lab-field">
          <label htmlFor="lab-fullname">Full name</label>
          <input id="lab-fullname" type="text" autoComplete="name" />
        </div>
      ),
    },
    {
      id: 'placeholder-as-label',
      wcag: ['3.3.2'],
      title: 'Placeholder used as the label',
      problem: 'The only hint is a placeholder: it disappears while typing. axe-core accepts it as a name, so only a custom check finds it.',
      fix: 'A visible label above the field.',
      Broken: () => (
        <div className="lab-field">
          <input type="email" placeholder="E-mail address" autoComplete="email" data-check="visible-label" />
        </div>
      ),
      Fixed: () => (
        <div className="lab-field">
          <label htmlFor="lab-email">E-mail address</label>
          <input id="lab-email" type="email" autoComplete="email" data-check="visible-label" />
        </div>
      ),
    },
    {
      id: 'unlinked-error',
      wcag: ['3.3.1', '1.3.1'],
      title: 'Error message not connected',
      problem: 'The red error text is just placed after the field. Screen readers do not announce it with the field.',
      fix: 'aria-invalid on the field, aria-describedby pointing to the error.',
      Broken: () => (
        <div className="lab-field">
          <label htmlFor="lab-zip-b">Postal code</label>
          <input id="lab-zip-b" defaultValue="80" data-check="error" />
          <p className="lab-error">Postal code must have 4 digits.</p>
        </div>
      ),
      Fixed: () => (
        <div className="lab-field">
          <label htmlFor="lab-zip-f">Postal code</label>
          <input id="lab-zip-f" defaultValue="80" aria-invalid="true" aria-describedby="lab-zip-err" data-check="error" />
          <p id="lab-zip-err" className="lab-error">
            Postal code must have 4 digits.
          </p>
        </div>
      ),
    },
    {
      id: 'required-not-announced',
      wcag: ['3.3.2', '1.3.1'],
      title: 'Required only shown with a star',
      problem: 'The label has an asterisk, but the field is not marked as required for assistive technology.',
      fix: 'The required attribute is set; the star is explained.',
      Broken: () => (
        <div className="lab-field">
          <label htmlFor="lab-phone-b">Phone *</label>
          <input id="lab-phone-b" type="tel" autoComplete="tel" data-check="required" />
        </div>
      ),
      Fixed: () => (
        <div className="lab-field">
          <label htmlFor="lab-phone-f">
            Phone <span aria-hidden="true">*</span>
          </label>
          <input id="lab-phone-f" type="tel" autoComplete="tel" required aria-required="true" data-check="required" />
          <p className="muted small">* required</p>
        </div>
      ),
    },
    {
      id: 'missing-autocomplete',
      wcag: ['1.3.5'],
      title: 'Personal data without autocomplete',
      problem: 'Name and e-mail fields have no autocomplete, so browsers and assistive tech cannot fill them.',
      fix: 'autocomplete="name" and autocomplete="email".',
      Broken: () => (
        <div className="lab-field">
          <label htmlFor="lab-ac-name-b">Your name</label>
          <input id="lab-ac-name-b" type="text" name="name" data-check="autocomplete" />
          <label htmlFor="lab-ac-mail-b">Your e-mail</label>
          <input id="lab-ac-mail-b" type="email" name="email" data-check="autocomplete" />
        </div>
      ),
      Fixed: () => (
        <div className="lab-field">
          <label htmlFor="lab-ac-name-f">Your name</label>
          <input id="lab-ac-name-f" type="text" name="name" autoComplete="name" data-check="autocomplete" />
          <label htmlFor="lab-ac-mail-f">Your e-mail</label>
          <input id="lab-ac-mail-f" type="email" name="email" autoComplete="email" data-check="autocomplete" />
        </div>
      ),
    },
    {
      id: 'ungrouped-radios',
      wcag: ['1.3.1'],
      title: 'Radio buttons without a group',
      problem: 'The question "Delivery" is a plain text; screen readers announce "Standard, radio button" without the question.',
      fix: 'A <fieldset> with a <legend>.',
      Broken: () => (
        <div className="lab-field">
          <div className="lab-fake-legend">Delivery</div>
          <label>
            <input type="radio" name="lab-delivery-b" /> Standard
          </label>
          <label>
            <input type="radio" name="lab-delivery-b" /> Express
          </label>
        </div>
      ),
      Fixed: () => (
        <fieldset className="lab-field">
          <legend>Delivery</legend>
          <label>
            <input type="radio" name="lab-delivery-f" /> Standard
          </label>
          <label>
            <input type="radio" name="lab-delivery-f" /> Express
          </label>
        </fieldset>
      ),
    },
    {
      id: 'select-without-name',
      wcag: ['4.1.2'],
      title: 'Select without a name',
      problem: 'A country dropdown with no label at all.',
      fix: 'A label for the select.',
      Broken: () => (
        <div className="lab-field">
          <select defaultValue="ch">
            <option value="ch">Switzerland</option>
            <option value="de">Germany</option>
          </select>
        </div>
      ),
      Fixed: () => (
        <div className="lab-field">
          <label htmlFor="lab-country">Country</label>
          <select id="lab-country" defaultValue="ch" autoComplete="country">
            <option value="ch">Switzerland</option>
            <option value="de">Germany</option>
          </select>
        </div>
      ),
    },
  ],
};
