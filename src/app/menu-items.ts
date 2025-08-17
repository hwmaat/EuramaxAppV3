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
      ]
    },
    {
      text: 'System',
      access:[1],
      icon: 'mdi mdi-cogs',
      items: [
        { text: 'Users', items: [
          { text: 'Users', path: 'system/users'},
          { text: 'Usergroups', path: 'system/usergroups'}
        ] },            
        { text: 'System Settings', path: 'settings', beginGroup:true, icon: 'mdi mdi-settings'}
      ]
    } 
  ];
  