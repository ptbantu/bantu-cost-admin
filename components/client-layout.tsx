"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Settings, Receipt, BookOpen, FileArchive, Building2, 
  LayoutDashboard, Users, Package, Shield, Bell, Menu, 
  ChevronDown, Wallet, Monitor, ChevronsLeft, ChevronsRight,
  Calculator, Truck, Zap, Bot, Workflow
} from "lucide-react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Auto-collapse on smaller screens (e.g., laptops < 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Breadcrumb logic based on pathname
  const getBreadcrumbs = () => {
    if (!pathname) return ['系统管理', '未知'];
    
    if (pathname.startsWith('/cost')) {
      return ['成本中心', getCostMenuName(pathname)];
    }
    if (pathname.startsWith('/system')) {
      return ['系统管理', getSystemMenuName(pathname)];
    }
    if (pathname.startsWith('/automation')) {
      return ['自动化中心', getAutomationMenuName(pathname)];
    }
    return ['系统管理', '员工管理']; // Default
  };

  const getCostMenuName = (path: string) => {
    switch (path) {
      case '/cost/billing': return '开票管理';
      case '/cost/journal': return '财务日记账';
      case '/cost/invoice': return '发票中心';
      case '/cost/entities': return '财税主体';
      case '/cost/reconciliation': return '对账管理';
      default: return '未知';
    }
  };

  const getSystemMenuName = (path: string) => {
    switch (path) {
      case '/system/dashboard': return '业务看板';
      case '/system/staff': return '员工管理';
      case '/system/products': return '产品管理';
      case '/system/vendors': return '供应商库';
      case '/system/dispatch': return '派单规则引擎';
      case '/system/audit': return '审计日志';
      default: return '未知';
    }
  };

  const getAutomationMenuName = (path: string) => {
    switch (path) {
      case '/automation/wecom-bots': return '机器人配置';
      case '/automation/workflows': return '流程引擎';
      default: return '未知';
    }
  };

  const breadcrumbs = getBreadcrumbs();
  const safePathname = pathname || '';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-14' : 'w-56'}
      `}>
        <div className={`h-14 flex items-center border-b border-slate-200 flex-shrink-0 overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'px-0 justify-center' : 'px-4'}`}>
          <Settings className={`w-4 h-4 text-slate-700 flex-shrink-0 ${isCollapsed ? '' : 'mr-2'}`} />
          <span className={`font-semibold text-sm text-slate-800 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            Bantu CRM
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 custom-scrollbar">
          <nav className="space-y-1">
            <NavGroup 
              icon={<Wallet className="w-[14px] h-[14px]" />} 
              label="成本中心" 
              basePath="/cost"
              pathname={safePathname}
              isCollapsed={isCollapsed}
              onExpand={() => setIsCollapsed(false)}
            >
              <SubNavItem href="/cost/billing" icon={<Receipt className="w-[14px] h-[14px]" />} label="开票管理" pathname={safePathname} isCollapsed={isCollapsed} />
              <SubNavItem href="/cost/journal" icon={<BookOpen className="w-[14px] h-[14px]" />} label="财务日记账" pathname={safePathname} isCollapsed={isCollapsed} />
              <SubNavItem href="/cost/invoice" icon={<FileArchive className="w-[14px] h-[14px]" />} label="发票中心" pathname={safePathname} isCollapsed={isCollapsed} />
              <SubNavItem href="/cost/entities" icon={<Building2 className="w-[14px] h-[14px]" />} label="财税主体" pathname={safePathname} isCollapsed={isCollapsed} />
              <SubNavItem href="/cost/reconciliation" icon={<Calculator className="w-[14px] h-[14px]" />} label="对账管理" pathname={safePathname} isCollapsed={isCollapsed} />
            </NavGroup>
            
            <div className="my-2 mx-4 h-px bg-slate-200" />
            
            <NavGroup 
              icon={<Monitor className="w-[14px] h-[14px]" />} 
              label="系统管理" 
              basePath="/system"
              pathname={safePathname}
              isCollapsed={isCollapsed}
              onExpand={() => setIsCollapsed(false)}
            >
              <SubNavItem href="/system/dashboard" icon={<LayoutDashboard className="w-[14px] h-[14px]" />} label="业务看板" pathname={safePathname} isCollapsed={isCollapsed} />
              <SubNavItem href="/system/staff" icon={<Users className="w-[14px] h-[14px]" />} label="员工管理" pathname={safePathname} isCollapsed={isCollapsed} />
              <SubNavItem href="/system/products" icon={<Package className="w-[14px] h-[14px]" />} label="产品管理" pathname={safePathname} isCollapsed={isCollapsed} />
              <SubNavItem href="/system/vendors" icon={<Truck className="w-[14px] h-[14px]" />} label="供应商库" pathname={safePathname} isCollapsed={isCollapsed} />
              <SubNavItem href="/system/dispatch" icon={<Workflow className="w-[14px] h-[14px]" />} label="派单规则引擎" pathname={safePathname} isCollapsed={isCollapsed} />
              <SubNavItem href="/system/audit" icon={<Shield className="w-[14px] h-[14px]" />} label="审计日志" pathname={safePathname} isCollapsed={isCollapsed} />
            </NavGroup>

            <div className="my-2 mx-4 h-px bg-slate-200" />

            <NavGroup 
              icon={<Zap className="w-[14px] h-[14px]" />} 
              label="自动化中心" 
              basePath="/automation"
              pathname={safePathname}
              isCollapsed={isCollapsed}
              onExpand={() => setIsCollapsed(false)}
            >
              <SubNavItem href="/automation/wecom-bots" icon={<Bot className="w-[14px] h-[14px]" />} label="机器人配置" pathname={safePathname} isCollapsed={isCollapsed} />
              <SubNavItem href="/automation/workflows" icon={<Workflow className="w-[14px] h-[14px]" />} label="流程引擎" pathname={safePathname} isCollapsed={isCollapsed} />
            </NavGroup>
          </nav>
        </div>

        {/* Collapse Toggle Button */}
        <div 
          className="h-12 border-t border-slate-200 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center text-slate-500 text-[12px]">
            <button className="md:hidden mr-3 text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-4 h-4" />
            </button>
            <span>{breadcrumbs[0]}</span>
            <span className="mx-2">/</span>
            <span className="text-slate-800 font-medium">{breadcrumbs[1]}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-slate-500 hover:text-slate-700 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-7 w-7 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              <img src="https://picsum.photos/seed/user1/100/100" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden bg-slate-50 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavGroup({ 
  icon, 
  label, 
  basePath,
  pathname,
  isCollapsed = false,
  onExpand,
  children 
}: { 
  icon: React.ReactNode; 
  label: string; 
  basePath: string;
  pathname: string;
  isCollapsed?: boolean;
  onExpand?: () => void;
  children: React.ReactNode;
}) {
  // Auto-expand if the current pathname starts with the group's basePath
  const [isOpen, setIsOpen] = useState(pathname.startsWith(basePath) || basePath === '/cost'); // Default cost to open

  // Update isOpen if pathname changes to match this group
  useEffect(() => {
    if (pathname.startsWith(basePath)) {
      setIsOpen(true);
    }
  }, [pathname, basePath]);

  const handleClick = () => {
    if (isCollapsed && onExpand) {
      onExpand();
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="mb-1">
      <button 
        onClick={handleClick}
        title={isCollapsed ? label : undefined}
        className={`w-full flex items-center h-8 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
      >
        <span className={`flex-shrink-0 text-slate-500 ${isCollapsed ? '' : 'mr-3'}`}>{icon}</span>
        {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">{label}</span>}
        {!isCollapsed && <ChevronDown className={`w-3.5 h-3.5 ml-auto text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />}
      </button>
      
      <div className={`grid transition-all duration-200 ease-in-out ${(isOpen && !isCollapsed) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="border-l border-slate-200 ml-4 pl-3 py-1 space-y-0.5 whitespace-nowrap">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubNavItem({ 
  href, 
  icon, 
  label, 
  pathname,
  isCollapsed = false
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  pathname: string;
  isCollapsed?: boolean;
}) {
  const active = pathname === href || (pathname === '/' && href === '/system/staff'); // Default active for demo
  
  return (
    <Link 
      href={href} 
      title={isCollapsed ? label : undefined}
      className={`flex items-center h-8 text-[12px] rounded-md transition-colors relative ${isCollapsed ? 'justify-center px-0 w-8 mx-auto' : 'px-3'} ${
        active 
          ? 'bg-blue-50 text-blue-700 font-medium' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {active && <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-blue-600 rounded-r-full" />}
      <span className={`flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'} ${isCollapsed ? '' : 'mr-2'}`}>{icon}</span>
      {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
    </Link>
  );
}
