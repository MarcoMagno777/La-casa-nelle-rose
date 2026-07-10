export interface FurnitureForm {
  name: string;
  description: string;
  category: string;
  existingImages: string[];
}


export const emptyFurnitureForm = (): FurnitureForm => ({
  name: '',
  description: '',
  category: '',
  existingImages: [],
});
