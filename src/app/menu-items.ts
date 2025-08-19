export interface MenuItem {
    text: string;
    path?: string;
    items?: MenuItem[];
    beginGroup?:boolean;
    icon?:string;
    access?: number[];
  }
  
  export const ACCESS = { ALL: 0, ADMIN: 1, SAFETYSHEET: 5,  } as const;

  export const menuItems: MenuItem[] = [
    { text: 'Home', path: '', icon :'mdi mdi-home', access:[ACCESS.ADMIN, ACCESS.SAFETYSHEET] },
    {
      text: 'Safetysheets',
      icon :'mdi mdi-soy-sauce-off',
      access:[ACCESS.ADMIN, ACCESS.SAFETYSHEET],
      items: [
        { text: 'Safety Sheets - Queue', path: '/safetysheets/queue', access:[ACCESS.ADMIN, ACCESS.SAFETYSHEET] },
      ]
    },
    {
      text: 'Admin',
      access:[ACCESS.ADMIN],
      icon: 'mdi mdi-account-cog-outline',
      items: [
        { text: 'Users', 
          items: [
          { text: 'Users', path: 'admin/users', access:[ACCESS.ADMIN]},
          { text: 'Usergroups', path: 'admin/usergroups', access:[ACCESS.ADMIN]}
        ]},            
        { text: 'System Settings', 
          path: 'settings', 
          icon: 'mdi mdi-cogs',
        items: [
             { text: 'System', path: 'system/settings', access:[ACCESS.ADMIN]},
        ]}  
      ]
    } ,
    
  ];
  