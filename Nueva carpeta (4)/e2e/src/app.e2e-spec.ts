import { browser, element, by, ElementFinder } from 'protractor';

const expectedH1 = 'Tour of maestros';
const expectedTitle = `${expectedH1}`;
const expectedH2 = 'My maestros';
const targetMaestro = { id: 16, name: 'RubberMan' };
const nameSuffix = 'X';

class Maestro {
  id: number;
  name: string;

  // Factory methods

  // Get maestro from s formatted as '<id> <name>'.
  static fromString(s: string): Maestro {
    return {
      id: +s.substr(0, s.indexOf(' ')),
      name: s.substr(s.indexOf(' ') + 1),
    };
  }

  // Get maestro id and name from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<Maestro> {
    // Get maestro id from the first <div>
    const id = await detail.all(by.css('div')).first().getText();
    // Get name from the h2
    const name = await detail.element(by.css('h2')).getText();
    return {
      id: +id.substr(id.indexOf(' ') + 1),
      name: name.substr(0, name.lastIndexOf(' '))
    };
  }
}

describe('Tutorial part 4', () => {
  beforeAll(() => browser.get(''));
  describe('Initial page', initialPageTests);
  describe('Select maestro', selectMaestroTests);
  describe('Update maestro', updateMaestroTests);
});

function initialPageTests() {
  it(`has title '${expectedTitle}'`, async () => {
    expect(await browser.getTitle()).toEqual(expectedTitle);
  });

  it(`has h1 '${expectedH1}'`, async () => {
    await expectHeading(1, expectedH1);
  });

  it(`has h2 '${expectedH2}'`, async () => {
    await expectHeading(2, expectedH2);
  });

  it('has the right number of maestros', async () => {
    const page = getPageElts();
    expect(await page.maestros.count()).toEqual(10);
  });

  it('has no selected maestro and no maestro details', async () => {
    const page = getPageElts();
    expect(await page.selected.isPresent()).toBeFalsy('selected maestro');
    expect(await page.maestroDetail.isPresent()).toBeFalsy('no maestro detail');
  });
}

function selectMaestroTests() {
  it(`selects ${targetMaestro.name} from maestro list`, async () => {
    const maestro = element(by.cssContainingText('li span.badge', targetMaestro.id.toString()));
    await maestro.click();
    // Nothing specific to expect other than lack of exceptions.
  });

  it(`has selected ${targetMaestro.name}`, async () => {
    const page = getPageElts();
    const expectedText = `${targetMaestro.id} ${targetMaestro.name}`;
    expect(await page.selected.getText()).toBe(expectedText);
  });

  it('shows selected maestro details', async () => {
    const page = getPageElts();
    const message = await getMessage();
    const maestro = await Maestro.fromDetail(page.maestroDetail);
    expect(maestro.id).toEqual(targetMaestro.id);
    expect(maestro.name).toEqual(targetMaestro.name.toUpperCase());
    // Message text contain id number matches the maestro.id number
    expect(await message.getText()).toContain(maestro.id);
  });
}

function updateMaestroTests() {
  it(`can update maestro name`, async () => {
    await addToMaestroName(nameSuffix);
    // Nothing specific to expect other than lack of exceptions.
  });

  it(`shows updated maestro name in details`, async () => {
    const page = getPageElts();
    const maestro = await Maestro.fromDetail(page.maestroDetail);
    const newName = targetMaestro.name + nameSuffix;
    expect(maestro.id).toEqual(targetMaestro.id);
    expect(maestro.name).toEqual(newName.toUpperCase());
  });

  it(`shows updated maestro name in list`, async () => {
    const page = getPageElts();
    const maestro = Maestro.fromString(await page.selected.getText());
    const newName = targetMaestro.name + nameSuffix;
    expect(maestro.id).toEqual(targetMaestro.id);
    expect(maestro.name).toEqual(newName);
  });

}

async function addToMaestroName(text: string): Promise<void> {
  const input = element(by.css('input'));
  await input.sendKeys(text);
}

async function expectHeading(hLevel: number, expectedText: string): Promise<void> {
  const hTag = `h${hLevel}`;
  const hText = await element(by.css(hTag)).getText();
  expect(hText).toEqual(expectedText, hTag);
}

function getPageElts() {
  return {
    maestros: element.all(by.css('app-root li')),
    selected: element(by.css('app-root li.selected')),
    maestroDetail: element(by.css('app-root > div, app-root > app-maestros > app-maestro-detail > div'))
  };
}

async function getMessage() {
  const maestro = element(by.cssContainingText('li span.badge', targetMaestro.id.toString()));
  await maestro.click();
  return element.all(by.css('app-root > app-messages > div > div')).get(1);
}
