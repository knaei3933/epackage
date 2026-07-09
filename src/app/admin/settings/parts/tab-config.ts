/**
 * Admin Settings Tab Configuration
 */

import {
  DollarSign,
  Package,
  Printer,
  Layers,
  Slash,
  Coins,
  Settings2,
  TrendingUp,
  Truck,
  Factory,
  Tag,
  PercentIcon,
  Mail,
  Cloud,
  Users,
} from 'lucide-react';
import type { TabKey, SettingGroup } from './types';

export const tabConfig: Record<TabKey, { name: string; nameJa: string; icon: any; groups: SettingGroup[] }> = {

  film_material: {
    name: '필름 재료',
    nameJa: 'フィルム材料',
    icon: Package,
    groups: [
      { title: '① 표준 필름', description: 'PET · PE · PP · NY 기본 소재', icon: Layers, keywords: ['표준','standard'], settingKeys: [
        'PET_unit_price', 'PET_density',
        'PE_density',
        'PP_density',
        'NY_unit_price', 'NY_density',
        'pet_cost', 'pe_cost', 'pp_cost',
      ]},
      { title: '② 알루미늄 / 증착', description: 'AL · VMPET · 알루미늄 증착', icon: Layers, keywords: ['알루미늄','AL','VMPET'], settingKeys: [
        'AL_unit_price', 'AL_density',
        'VMPET_unit_price', 'VMPET_density',
        'alu_vapor_cost', 'aluminum_cost',
        'opp_alu_foil_cost',
        'pet_transparent_cost',
      ]},
      { title: '③ 종이 / 크라프트', description: '크라프트지 · 종이 라미네이트', icon: Layers, keywords: ['크라프트','KRAFT','종이','PAPER'], settingKeys: [
        'KRAFT_unit_price', 'KRAFT_density',
        'kraft_pe_cost', 'paper_laminate_cost', 'PAPER_LAMINATE_density',
      ]},
     { title: '④ LLDPE', description: 'LLDPE 단가/밀도', icon: Layers, keywords: ['LLDPE'], settingKeys: [
       'LLDPE_unit_price', 'LLDPE_density',
     ]},
      { title: '⑤ 원단 인상률', description: '원단 단가 일괄 인상 (협상결과 10%)', icon: PercentIcon, keywords: ['markup','인상률','rate'], settingKeys: [
        'material_markup_rate',
      ]},
   ]
 },
  pouch_processing: {
    name: '파우치 가공',
    nameJa: 'ポーチ加工',
    icon: Layers,
    groups: [
      { title: '① 삼방(3면 붙임)', description: 'flat_3_side 계열', icon: Layers, keywords: ['3_side','삼방'], settingKeys: [
        'flat_3_side_cost', 'flat_3_side_coefficient', 'flat_3_side_minimum_price', 'flat_3_side_zipper_surcharge',
      ]},
      { title: '② 스탠드파우치', description: 'stand_up 계열', icon: Layers, keywords: ['stand_up','스탠드'], settingKeys: [
        'stand_up_cost', 'stand_up_coefficient', 'stand_up_minimum_price', 'stand_up_zipper_surcharge',
      ]},
      { title: '③ T방 / M방', description: 't_shape · m_shape 계열', icon: Layers, keywords: ['t_shape','m_shape'], settingKeys: [
        't_shape_cost', 't_shape_coefficient', 't_shape_minimum_price', 't_shape_zipper_surcharge',
        'm_shape_cost', 'm_shape_coefficient', 'm_shape_minimum_price', 'm_shape_zipper_surcharge',
      ]},
      { title: '④ 박스형(가제트)', description: 'box 계열', icon: Layers, keywords: ['box','박스'], settingKeys: [
        'box_cost', 'box_coefficient', 'box_minimum_price', 'box_zipper_surcharge',
      ]},
      { title: '⑤ 기본 단가형 (개당)', description: 'flat · standing · spout · soft · gusset · special · roll · zip', icon: Coins, keywords: ['cost'], settingKeys: [
        'flat_pouch_cost', 'flat_with_zip_cost', 'standing_pouch_cost', 'spout_pouch_cost',
        'soft_pouch_cost', 'gusset_cost', 'special_cost', 'roll_film_cost',
      ]},
     { title: '⑥ 기타', description: 'other 계열', icon: Settings2, keywords: ['other','기타'], settingKeys: [
       'other_cost', 'other_coefficient', 'other_minimum_price',
     ]},
      { title: '⑦ 스패들 / 외주 배송', description: '스패웃 단가 · 왕복배송 · 외주배송', icon: Coins, keywords: ['spout','스패웃','outsourcing','round_trip'], settingKeys: [
        'spout_price_9', 'spout_price_15', 'spout_price_18', 'spout_price_22', 'spout_price_28',
        'spout_round_trip_shipping', 'outsourcing_shipping',
      ]},
   ]
 },
  printing: {
    name: '인쇄',
    nameJa: '印刷',
    icon: Printer,
    groups: [
      { title: '① 그라비아 인쇄', description: '그라비아 방식 설정', icon: Printer, keywords: ['그라비아','gravure'], settingKeys: [
        'gravure_per_color_per_meter', 'gravure_min_charge', 'gravure_setup_fee',
      ]},
      { title: '② 디지털 인쇄', description: '디지털 방식 설정', icon: Printer, keywords: ['디지털','digital'], settingKeys: [
        'digital_per_color_per_meter', 'digital_min_charge', 'digital_setup_fee',
      ]},
      { title: '③ 공통 / 특수', description: '공통 단가 · UV · 매트', icon: Factory, keywords: ['공통','UV','매트'], settingKeys: [
        'cost_per_m2', 'uv_fixed_cost', 'uv_surcharge', 'matte_cost_per_m',
      ]},
    ]
  },
  lamination: {
    name: '라미네이트',
    nameJa: 'ラミネート',
    icon: Layers,
    groups: [
      { title: '① 라미네이트 단가', description: 'm²당 단가 (AL 유무별)', icon: Layers, keywords: ['라미','LAMINATION','cost'], settingKeys: [
        'cost_per_m2', 'cost_per_m2_with_al',
      ]},
    ]
  },
  slitter: {
    name: '슬리터',
    nameJa: 'スリッター',
    icon: Slash,
    groups: [
      { title: '① 슬리팅 비용', description: '재단 공정 비용', icon: Slash, keywords: ['슬리','SLIT','재단','COST'], settingKeys: [
        'cost_per_m', 'min_cost',
      ]},
    ]
  },
  exchange_rate: {
    name: '환율/관세',
    nameJa: '為替/関税',
    icon: TrendingUp,
    groups: [
      { title: '① 환율', description: '통화별 환율', icon: TrendingUp, keywords: ['환율','EXCHANGE','RATE'], settingKeys: [
        'krw_to_jpy',
      ]},
      { title: '② 관세 / 부가세', description: '수입 관련 세율 (관세율)', icon: Coins, keywords: ['관세','tax','부가세','vat','関税','duty','import'], settingKeys: [
        'import_duty',
      ]},
    ]
  },
  delivery: {
    name: '배송',
    nameJa: '配送',
    icon: Truck,
    groups: [
      { title: '① 롤당 기준', description: '롤당 배송비 / 중량', icon: Truck, keywords: ['롤','roll','kg_per'], settingKeys: [
        'cost_per_roll', 'kg_per_roll',
      ]},
      { title: '② 국내 배송', description: 'domestic 단가/임계값', icon: Truck, keywords: ['domestic','국내'], settingKeys: [
        'domestic_base', 'domestic_per_kg', 'domestic_free_threshold',
      ]},
     { title: '③ 국제 배송', description: 'international 단가/임계값', icon: Truck, keywords: ['international','국제'], settingKeys: [
       'international_base', 'international_per_kg', 'international_free_threshold',
     ]},
      { title: '④ 박스 중량', description: '골판지 박스 1개 중량 (배송 박스수 계산)', icon: Package, keywords: ['box','박스','weight'], settingKeys: [
        'box_weight_kg',
      ]},
   ]
 },
  production: {
    name: '생산 설정',
    nameJa: '生産設定',
    icon: Factory,
    groups: [
      { title: '① 주문 수량', description: '최소/최대 주문 · 소량 기준', icon: Settings2, keywords: ['주문','order','small_lot'], settingKeys: [
        'min_order_quantity', 'max_order_quantity', 'small_lot_threshold', 'small_lot_surcharge',
      ]},
      { title: '② 원단 / 폭', description: '원단 폭 설정', icon: Layers, keywords: ['폭','width','material'], settingKeys: [
        'default_material_width', 'material_width_540', 'material_width_760',
      ]},
      { title: '③ 롤 필름', description: '롤 필름 단가/인쇄/라미/슬리터', icon: Layers, keywords: ['roll_film'], settingKeys: [
        'roll_film_cost_per_m', 'roll_film_printing_cost_per_m', 'roll_film_lamination_cost_per_m',
        'roll_film_slitter_cost_per_m', 'roll_film_slitter_min_cost',
      ]},
      { title: '④ 마진 / 로스율', description: '제조 마진 · 로스율 · 후가공 배수', icon: TrendingUp, keywords: ['margin','loss','multiplier'], settingKeys: [
        'manufacturer_margin', 'default_loss_rate', 'default_post_processing_multiplier',
      ]},
     { title: '⑤ 최소 가격 / UV', description: '최소 가격 · UV 인쇄 비용', icon: Coins, keywords: ['minimum','uv'], settingKeys: [
       'minimum_price', 'uv_printing_fixed_cost', 'uv_printing_surcharge',
     ]},
      { title: '⑥ 스패들 최소 수량', description: '스패웃파우치 최소 주문 수량', icon: Settings2, keywords: ['spout','스패웃','min_quantity'], settingKeys: [
        'spout_min_quantity',
      ]},
      { title: '⑦ 제조사 발주 메일', description: '한국 제조사 발주 메일 수신 주소', icon: Mail, keywords: ['manufacturer','order_email','발주','제조사'], settingKeys: [
        'manufacturer_order_email',
      ]},
    ]
  },
  pricing: {
    name: '가격 설정',
    nameJa: '価格設定',
    icon: Coins,
    groups: [
      { title: '① 마진율', description: '가격 정책 설정', icon: TrendingUp, keywords: ['마진','MARGIN','마크업','MARKUP','기본','제조업체','최소','판매'], settingKeys: [
        'default_markup_rate', 'manufacturer_margin', 'minimum_price_jpy',
      ]},
      { title: '② 고객별 할인율', description: '고객별 할인율 관리 (0% ~ -50%)', icon: PercentIcon, keywords: ['__CUSTOMER_MARKUP__'] },
    ]
  },
  designer: {
    name: '디자이너',
    nameJa: 'デザイナー設定',
    icon: Mail,
    groups: [
      { title: '메일 주소 관리', description: '한국 디자이너의 이메일 주소 설정', icon: Mail, keywords: ['DESIGNER', 'EMAIL', '메일'] },
    ]
  },
  email: {
    name: '이메일 설정',
    nameJa: 'メール設定',
    icon: Mail,
    groups: [
      { title: 'SMTP 설정', description: '이메일 서버 연결 설정', icon: Settings2, keywords: ['SMTP', '서버', '포트', 'HOST'] },
      { title: '기능 토글', description: '이메일 자동 발송 설정', icon: Tag, keywords: ['TOGGLE', '사용', '비활성'] },
      { title: '회사 정보', description: '이메일 서명용 회사 정보', icon: Package, keywords: ['회사', 'COMPANY', '주소'] },
      { title: '은행 계좌', description: '청구서용 은행 계좌 정보', icon: Coins, keywords: ['은행', 'BANK', '계좌'] },
      { title: '알림 수신자', description: '관리자/영업/생산팀 알림 이메일', icon: Mail, keywords: ['RECIPIENT', '수신자', '팀'] },
    ]
  },
  integrations: {
    name: '외부 연동',
    nameJa: '外部連携',
    icon: Cloud,
    groups: [
      { title: 'Google Drive', description: '파일 업로드 연동 설정', icon: Cloud, keywords: ['GOOGLE', 'DRIVE', '연동', '토큰'] },
      { title: '고객 단가율', description: '고객별 마크업 설정', icon: Users, keywords: ['고객', '단가', '마크업'] },
    ]
  },
};

// Helper function to clean descriptions
