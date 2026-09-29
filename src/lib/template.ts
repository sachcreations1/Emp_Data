
export interface CardElement {
  x: number;
  y: number;
  fontSize: number;
  fontWeight: number;
  color: string;
  width: number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface PhotoElement {
    x: number;
    y: number;
    size: number;
}

export interface LogoElement extends CardElement {
    size: number;
}

export interface Template {
  front: {
    name: CardElement;
    designation: CardElement;
    department: CardElement;
    empId: CardElement;
    photo: PhotoElement;
    backgroundImage?: string;
    globalOffsetX: number;
    globalOffsetY: number;
  };
  back: {
    dojLabel: CardElement;
    dojValue: CardElement;
    bloodGroupLabel: CardElement;
    bloodGroupValue: CardElement;
    phoneLabel: CardElement;
    phoneValue: CardElement;
    emergencyContactLabel: CardElement;
    emergencyContactValue: CardElement;
    addressLabel: CardElement;
    addressValue: CardElement;
    authorisedSign: CardElement;
    backgroundImage?: string;
    globalOffsetX: number;
    globalOffsetY: number;
  };
}

export const defaultTemplate: Template = {
  front: {
    photo: { x: 92, y: 60, size: 140 },
    name: { x: 0, y: 220, fontSize: 28, fontWeight: 700, color: "#FFFFFF", width: 323, textAlign: 'center' },
    designation: { x: 40, y: 300, fontSize: 18, fontWeight: 500, color: "#C6FF00", width: 250, textAlign: 'left' },
    empId: { x: 40, y: 330, fontSize: 18, fontWeight: 500, color: "#C6FF00", width: 250, textAlign: 'left' },
    department: { x: 40, y: 360, fontSize: 18, fontWeight: 500, color: "#C6FF00", width: 250, textAlign: 'left' },
    backgroundImage: "",
    globalOffsetX: 0,
    globalOffsetY: 0
  },
  back: {
    dojLabel: { x: 25, y: 280, fontSize: 14, fontWeight: 500, color: '#B4E380', width: 110, textAlign: 'left' },
    dojValue: { x: 145, y: 280, fontSize: 14, fontWeight: 500, color: '#FFFFFF', width: 150, textAlign: 'left' },
    bloodGroupLabel: { x: 25, y: 300, fontSize: 14, fontWeight: 500, color: '#B4E380', width: 110, textAlign: 'left' },
    bloodGroupValue: { x: 145, y: 300, fontSize: 14, fontWeight: 500, color: '#FFFFFF', width: 150, textAlign: 'left' },
    phoneLabel: { x: 25, y: 320, fontSize: 14, fontWeight: 500, color: '#B4E380', width: 110, textAlign: 'left' },
    phoneValue: { x: 145, y: 320, fontSize: 14, fontWeight: 500, color: '#FFFFFF', width: 150, textAlign: 'left' },
    emergencyContactLabel: { x: 25, y: 340, fontSize: 14, fontWeight: 500, color: '#B4E380', width: 110, textAlign: 'left' },
    emergencyContactValue: { x: 145, y: 340, fontSize: 14, fontWeight: 500, color: '#FFFFFF', width: 150, textAlign: 'left' },
    addressLabel: { x: 25, y: 360, fontSize: 14, fontWeight: 500, color: '#B4E380', width: 110, textAlign: 'left' },
    addressValue: { x: 145, y: 360, fontSize: 14, fontWeight: 500, color: '#FFFFFF', width: 150, textAlign: 'left' },
    authorisedSign: { x: 0, y: 450, fontSize: 14, fontWeight: 500, color: '#FFFFFF', width: 323, textAlign: 'center' },
    backgroundImage: "",
    globalOffsetX: 0,
    globalOffsetY: 0
  }
};

export const getTemplate = (): Template => {
    if(typeof window === 'undefined') return defaultTemplate;
    const saved = localStorage.getItem('idCardTemplate');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error("Template in localStorage is not an object.");
        }
        
        // Deep merge with defaults
        const mergeDeep = (target: any, source: any) => {
          for (const key of Object.keys(source)) {
            if (source[key] instanceof Object && key in target) {
              Object.assign(source[key], mergeDeep(target[key], source[key]))
            }
          }
          return { ...target, ...source };
        }

        const mergedTemplate = mergeDeep(JSON.parse(JSON.stringify(defaultTemplate)), parsed);

        // If the merged result is different from what was saved, update localStorage.
        if (JSON.stringify(mergedTemplate) !== saved) {
          saveTemplate(mergedTemplate as Template);
        }

        return mergedTemplate as Template;
      } catch (error) {
        console.error("Failed to parse template from localStorage, returning default:", error);
        saveTemplate(defaultTemplate);
        return defaultTemplate;
      }
    }
    return defaultTemplate;
};

export const saveTemplate = (template: Template) => {
    if(typeof window === 'undefined') return;
    localStorage.setItem('idCardTemplate', JSON.stringify(template));
}
