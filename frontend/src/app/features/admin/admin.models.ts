export interface FurnitureForm {
  name: string;
  description: string;
  placement: string;
  category: string;
  period: string;
  existingImages: string[];
}


export const emptyFurnitureForm = (): FurnitureForm => ({
  name: '',
  description: '',
  placement: '',
  category: '',
  period: '',
  existingImages: [],
});
