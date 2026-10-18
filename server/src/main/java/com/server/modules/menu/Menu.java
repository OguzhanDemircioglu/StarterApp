package com.server.modules.menu;

import com.server.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SoftDelete;

/**
 * Menüler sadece migration class'larıyla yönetilir. Ağaç parentId üzerinden Java'da kurulur;
 * bilinçli olarak JPA self-ilişkisi (@ManyToOne parent / @OneToMany children) kurulmaz.
 */
@Getter
@Setter
@Entity
@SoftDelete
@Table(name = "menus")
public class Menu extends BaseEntity {

    @Column(name = "parent_id")
    private Long parentId;

    // Benzersizlik silinmemiş kayıtlara özel index ile sağlanır (V001_UniqueIndexes).
    @Column(name = "title_key", nullable = false, length = 100)
    private String titleKey;

    @Column(name = "route", length = 200)
    private String route;

    @Column(name = "icon", length = 50)
    private String icon;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "admin_only", nullable = false)
    private boolean adminOnly;
}
