/**
 * Central icon registry (Material Icons, outlined style, from @mui/icons-material).
 * Path imports keep the bundle small — only the icons used here are included.
 */
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import LoginOutlined from '@mui/icons-material/LoginOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import HourglassTopOutlined from '@mui/icons-material/HourglassTopOutlined';
import TableChartOutlined from '@mui/icons-material/TableChartOutlined';
import WebAssetOutlined from '@mui/icons-material/WebAssetOutlined';
import ForumOutlined from '@mui/icons-material/ForumOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import ArrowUpwardOutlined from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlined from '@mui/icons-material/ArrowDownwardOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import BackpackOutlined from '@mui/icons-material/BackpackOutlined';
import LocalDrinkOutlined from '@mui/icons-material/LocalDrinkOutlined';
import HandymanOutlined from '@mui/icons-material/HandymanOutlined';
import CardGiftcardOutlined from '@mui/icons-material/CardGiftcardOutlined';
import BakeryDiningOutlined from '@mui/icons-material/BakeryDiningOutlined';
import EmojiFoodBeverageOutlined from '@mui/icons-material/EmojiFoodBeverageOutlined';
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';

export const Icons = {
  brand: FactCheckOutlined,
  cart: ShoppingCartOutlined,
  login: LoginOutlined,
  logout: LogoutOutlined,
  forms: AssignmentOutlined,
  dynamic: HourglassTopOutlined,
  tables: TableChartOutlined,
  frames: WebAssetOutlined,
  dialogs: ForumOutlined,
  shop: StorefrontOutlined,
  arrowForward: ArrowForwardOutlined,
  openInNew: OpenInNewOutlined,
  expand: ExpandMoreOutlined,
  sortAsc: ArrowUpwardOutlined,
  sortDesc: ArrowDownwardOutlined,
  success: CheckCircleOutlined,
  delete: DeleteOutlineOutlined,
};

/** Product icons, referenced by the "icon" field in public/api/products.json. */
const PRODUCT_ICONS = {
  backpack: BackpackOutlined,
  bottle: LocalDrinkOutlined,
  tool: HandymanOutlined,
  gift: CardGiftcardOutlined,
  bakery: BakeryDiningOutlined,
  tea: EmojiFoodBeverageOutlined,
  apparel: CheckroomOutlined,
};

export function productIcon(name: string | undefined) {
  return PRODUCT_ICONS[name as keyof typeof PRODUCT_ICONS] ?? Inventory2Outlined;
}
