import { Equipment } from './equipment';

export class EquipmentInfo {
  equipments: Equipment[] = [];
  equipmentSelected: Equipment = new Equipment();
  loading: boolean = true;

  constructor(equipmentInfo?: EquipmentInfo) {
    if (equipmentInfo) {
      this.update(equipmentInfo);
    }
  }

  updateEquipments(equipments: Equipment[]): void {
    this.equipments = equipments;
  }

  updateEquipmentSelected(equipment: Equipment): void {
    this.equipmentSelected.update(equipment);
  }

  updateLoading(isLoading: boolean): void {
    this.loading = isLoading;
  }

  update(equipmentInfo: EquipmentInfo): void {
    this.updateEquipments(equipmentInfo.equipments);
    this.updateEquipmentSelected(equipmentInfo.equipmentSelected);
    this.updateLoading(equipmentInfo.loading);
  }

  get equipmentAmount(): number {
    return this.equipments?.length ?? 0;
  }
}
