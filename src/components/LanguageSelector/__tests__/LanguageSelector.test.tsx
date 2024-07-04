import LanguageSelector from '../LanguageSelector';
import { renderWithProviders } from 'utils/TestUtils';

it('LanguageSelector', () => {
    renderWithProviders(<LanguageSelector />);
    const display = document.querySelector('div');
    expect(display).toMatchInlineSnapshot(`
      <div>
        <div>
          <select>
            <option
              class="dropdown-item"
              selected=""
              value="en"
            >
              English
            </option>
            <option
              class="dropdown-item"
              value="es"
            >
              Spanish
            </option>
            <option
              class="dropdown-item"
              value="fr"
            >
              French
            </option>
            <option
              class="dropdown-item"
              value="de"
            >
              German
            </option>
            <option
              class="dropdown-item"
              value="it"
            >
              Italian
            </option>
            <option
              class="dropdown-item"
              value="jp"
            >
              Japanese
            </option>
          </select>
        </div>
      </div>
    `);
});
