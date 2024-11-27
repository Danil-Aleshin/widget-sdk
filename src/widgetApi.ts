import type { IBaseWidgetSettings } from "./settings/baseWidget";
import type { IGroupSettings } from "./metaDescription";
import type { IWidgetFiltration } from "./filtration";
import type { IWidgetPlaceholderController, IWidgetPlaceholderValues } from "./placeholder";
import type { IWidgetFormatting } from "./formatting";
import type { IGlobalContext } from "./widgetContext";
import type { TAction, TActionValidator } from "./actions";
import type { ICalculatorFilter } from "./calculators/calculator/calculator";
import type { ICalculatorFactory } from "./calculators";
import type { IDefinition } from "./definition";
import type { TContextMenu } from "./contextMenu";
import type { IViewContext } from "./viewContext";

export type TLaunchActionParams = {
  /** Запускаемое действие */
  action: TAction;
  /** Callback, вызываемый при успешном запуске действия */
  onSuccess: () => void;

  /** Требуется ли подтверждение о запуске (откроется модальное окно) */
  needConfirmation?: boolean;

  /** Фильтрация для способов ввода COLUMN и FORMULA */
  filters: ICalculatorFilter[];
  /** Выбранные имена событий для способа ввода EVENT, START_EVENT и FINISH_EVENT */
  eventNames?: [string] | [string, string];
  /** Callback, вызывается при успешном получении данных модального окна запуска действия,
   * а так же при клике на другое действие, вызовется для предыдущего действия
   */
  resetAndHandleModalData?: () => void;
};

export type TWidgetContainer = {
  /** Имеет ли контейнер виджета ограниченную максимальную высоту */
  isMaxHeightLimited: boolean;
  /** Установить минимальную высоту рабочей области виджета */
  setContentMinHeight(value: number): void;
};

export interface IWidgetPersistValue<T extends object = object> {
  get(): T | null;
  set(value: T | null): void;
}

export interface IWidgetProps<WidgetSettings extends IBaseWidgetSettings = IBaseWidgetSettings> {
  // todo: удалить при переходе на 5 мажорную версию [BI-14040]
  /** @deprecated в качестве guid используется ключ виджета(уникален в рамках образа для каждого экземпляра виджета) */
  guid: string;
  /** Настройки виджета */
  settings: WidgetSettings;

  /** Фабрика для создания вычислителей */
  calculatorFactory: ICalculatorFactory;

  /** Объект для взаимодействия с фильтрацией */
  filtration: IWidgetFiltration;

  /** Объект для работы с контейнером виджета */
  widgetContainer: TWidgetContainer;
  /**
   * Прокручиваемая область, отображающая образ с виджетами.
   * Служит пространством для размещения и просмотра виджетов как единого документа.
   */
  rootViewContainer: HTMLDivElement;
  /** Функция для управления контекстными меню */
  setContextMenu: (key: string, value: TContextMenu | null) => void;

  /** Объект для управления плейсхолдером */
  placeholder: IWidgetPlaceholderController;
  /** Объект для получения значений плейсхолдера */
  placeholderValues: IWidgetPlaceholderValues;

  /** Функция для подписки на расфокусировку виджета (например, при фокусировке на другом виджете) */
  subscribeOnFocusOut(subscriber: () => void): void;
  /** Функция для захвата фокуса виджетом: остальные виджеты будут оповещены о расфокусировке */
  captureFocus(): void;

  /** Глобальный контекст. Содержит информацию из отчета, пространства и платформы системы */
  globalContext: IGlobalContext;
  /** Контекст образа */
  viewContext: IViewContext;

  /** Функция для запуска действия */
  launchAction(params: TLaunchActionParams): void;
  /** Функция валидации действия */
  actionValidator: TActionValidator;

  /** Аксессор для persist-значения виджета, хранимого в localStorage и URL */
  persistValue: IWidgetPersistValue;
}

/** Манифест виджета */
export interface IWidgetManifest {
  /** Уникальный идентификатор формата uuid */
  uuid: string;
  /** Локализация названия */
  name: Partial<{
    ru: string;
    en: string;
  }>;
  /** Мажорная версия widget-sdk, использованная при разработке виджета */
  sdk_version?: number;
  /** Путь до js-файла, который является входной точкой виджета */
  entry: string;
  /** Путь до иконки(svg или png) */
  icon?: string;
  /** Находится ли виджет на beta-стадии разработки */
  is_beta?: boolean;
  /** Размер колонки с виджетом */
  default_size?: {
    /** Минимальная высота колонки с виджетом (по умолчанию 70) */
    min_height?: number;
    /** Минимальная ширина колонки с виджетом (по умолчанию 180) */
    min_width?: number;
  };
  /** Параметры контейнера виджета */
  container_params?: {
    /** @deprecated необходимо использовать show_title */
    show_header?: boolean;
    /** Отображать ли системный заголовок виджета (по умолчанию false) */
    show_title?: boolean;
    /** Отображать ли markdown "описание" виджета (по умолчанию false) */
    show_markdown?: boolean;
  };
}

export interface ICustomWidgetProps<
  WidgetSettings extends IBaseWidgetSettings = IBaseWidgetSettings,
> extends IWidgetProps<WidgetSettings> {
  /** Манифест виджета */
  manifest: Partial<IWidgetManifest>;
  /** body DOM элемент родительского приложения */
  bodyElement: HTMLBodyElement;
  /** Объект для форматирования значений */
  formatting: IWidgetFormatting;
  /** Функция для получения ресурса виджета по имени файла */
  getWidgetAsset: (fileName: string) => Promise<Blob | null>;
}

export interface IWidget<WidgetSettings extends IBaseWidgetSettings> {
  /** метод будет вызван при добавлении виджета в отчет
   * и после загрузки исходного кода виджета. В данном методе
   * можно инициализировать библиотеку отображения, создать
   * дополнительные DOM-элементы и подготовить виджет перед
   * вызовом метода mount
   *
   * @param container - DOM элемент в котором будет отображаться виджет
   * */
  initialize(container: HTMLElement): void;
  /**
   * метод будет вызван после добавления виджета в отчет, в тот момент
   * когда система будет готова отобразить виджет. В данном методе можно
   * начать визуализировать виджет
   * @param container - DOM элемент в котором будет отображаться виджет
   * @param props - содержит информацию которую система передаёт виджетам,
   * например, язык используемый системой, информация об отчете, настройки,
   * фабрику вычислителей и.др.
   */
  mount(container: HTMLElement, props: ICustomWidgetProps<WidgetSettings>): void;

  /**
   * метод будет вызываться каждый раз, когда props были обновлены и необходимо
   * выполнить перерисовку виджета
   * @param container - DOM элемент в котором будет отображаться виджет
   * @param props - содержит информацию которую система передаёт виджетам,
   * например, язык используемый системой, информация об отчете, настройки,
   * фабрику вычислителей и.др.
   */
  update(container: HTMLElement, props: ICustomWidgetProps<WidgetSettings>): void;
  /**
   * метод будет вызван когда происходит размонтирование виджета, например,
   * пользователь удаляет виджет со страницы отчета
   * @param container - DOM элемент в котором отображался виджет
   */
  unmount(container: HTMLElement): void;
}

export interface IFillSettings<WidgetSettings extends IBaseWidgetSettings> {
  (settings: Partial<WidgetSettings>, context: IGlobalContext): void;
}

export interface IWidgetEntity<
  WidgetSettings extends IBaseWidgetSettings,
  GroupSettings extends IGroupSettings,
> {
  new (): IWidget<WidgetSettings>;
  definition: IDefinition<WidgetSettings, GroupSettings>;
}
