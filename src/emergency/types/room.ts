export interface Room {
  hospitalId: string;
  updatedAt: Date;
  available_emergency_room_count: number;
  available_surgery_room_count: number;
  available_hospital_room_count: number;
  isAvailableCT: boolean;
  isAvailableMRI: boolean;
  isAvailableAmbulance: boolean;
  institution_name: string;
  emergency_duty_tel: string;
  emergency_tel: string;
  parent_city: string;
}
