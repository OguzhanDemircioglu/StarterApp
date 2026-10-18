package com.server.modules.menu;

import com.server.security.Role;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MenuServiceImplTest {

    @Mock
    private MenuRepository repository;

    @InjectMocks
    private MenuServiceImpl service;

    @Test
    void adminGetsFullTreeInSortOrder() {
        when(repository.findAllByOrderBySortOrderAsc()).thenReturn(List.of(
                menu(1L, null, "menu_definitions", 1, false),
                menu(3L, 1L, "menu_categories", 1, false),
                menu(4L, 1L, "menu_products", 2, false),
                menu(2L, null, "menu_administration", 99, true),
                menu(5L, 2L, "menu_users", 1, true)));

        List<MenuNode> tree = service.getMenuTree(Role.ADMIN);

        assertThat(tree).extracting(MenuNode::titleKey).containsExactly("menu_definitions", "menu_administration");
        assertThat(tree.getFirst().children()).extracting(MenuNode::titleKey)
                .containsExactly("menu_categories", "menu_products");
        assertThat(tree.get(1).children()).extracting(MenuNode::titleKey).containsExactly("menu_users");
    }

    @Test
    void childOfInvisibleParentIsNotShown() {
        // USER sorgusu admin_only menüleri döndürmez; normal alt menüsü kalsa bile üst menü olmadan görünmez.
        when(repository.findAllByAdminOnlyFalseOrderBySortOrderAsc()).thenReturn(List.of(
                menu(1L, null, "menu_definitions", 1, false),
                menu(3L, 1L, "menu_categories", 1, false),
                menu(6L, 2L, "menu_orphan_of_admin_group", 2, false)));

        List<MenuNode> tree = service.getMenuTree(Role.USER);

        assertThat(tree).extracting(MenuNode::titleKey).containsExactly("menu_definitions");
        assertThat(tree.getFirst().children()).extracting(MenuNode::titleKey).containsExactly("menu_categories");
    }

    private static Menu menu(Long id, Long parentId, String titleKey, int sortOrder, boolean adminOnly) {
        Menu menu = new Menu();
        menu.setId(id);
        menu.setParentId(parentId);
        menu.setTitleKey(titleKey);
        menu.setSortOrder(sortOrder);
        menu.setAdminOnly(adminOnly);
        return menu;
    }
}
