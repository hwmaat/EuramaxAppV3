export interface MenuItem {
    text: string;
    path?: string;
    items?: MenuItem[];
    beginGroup?:boolean;
    icon?:string;
    access?: number[]; 
       
  }
  
  export const menuItems: MenuItem[] = [
    { text: 'Home', path: '', icon :'mdi mdi-home', access:[0] },
    {
      text: 'Safetysheets',
      icon :'mdi mdi-soy-sauce-off',
      access:[1,2],
      items: [        
        { text: 'Safety Sheets - Queue', path: '/safetysheets/queue'},
        { text: 'Safety Sheets - Achterstand', path: '/safetysheets/vibachterstand'},
        { text: 'Safety sheets - processed', beginGroup:true, path: '/safetysheets/import'},
        { text: 'Safety sheets - Edit', path: '/safetysheets/edit-euravib/'},
        { text: 'Base data', beginGroup:true,  items: [
          { text: 'Vib Suppliers', path: '/safetysheets/vibsuppliers'}
          ]}
      ]
    },
    { text: 'X-rite', access:[1,3], icon: 'mdi mdi-alpha-x',
      items: [
        { text: 'Measuring results', path: '/production/xritespl' }
        ]},   
    {
      text: 'Baan', icon: 'mdi mdi-invoice-text-edit-outline',
      access:[6],
      items: [
        { text: 'Base data', items: [
          { text: 'Administrations', path: '/baan/administrations'},
          { text: 'Customers', path: '/baan/customers'},
          { text: 'Suppliers', path: '/baan/suppliers'}
        ] },
        { text: 'Sales orders', items: [
        { text: 'Active Orders', path: '/production/activeorders' },
        { text: 'Order Historie', path: '/production/historyorders'}
        ]},        
      ]
    },
    {
      text: 'System',
      access:[1],
      icon: 'mdi mdi-cogs',
      items: [
        { text: 'Users', items: [
          { text: 'Users', path: 'system/users'}
        ] },            
        { text: 'System Settings', path: 'settings', beginGroup:true, icon: 'mdi mdi-settings'}
      ]
    } ,
    {
      text: 'Help',
      access:[0],
      icon: 'mdi mdi-help-circle',
      items: [
        { text: 'Help Pages', path: 'system/helppages' },
        { text: 'About', path: 'about' }
      ]
    }
  ];
  