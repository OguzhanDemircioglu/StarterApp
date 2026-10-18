package com.server.modules.menu;

import com.server.security.Role;

import java.util.List;

public interface MenuService {

    /** ADMIN bütün menüleri, USER sadece admin_only = false olanları görür. */
    List<MenuNode> getMenuTree(Role role);
}
