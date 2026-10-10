package com.fiwdee.pattern.strategy.discount;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Factory and registry for DiscountStrategy implementations.
 * Enables runtime resolution and dynamic registration of new discount rules (OCP).
 */
@Component
public class DiscountStrategyFactory {

    private final Map<String, DiscountStrategy> strategyMap;

    public DiscountStrategyFactory(List<DiscountStrategy> strategies) {
        if (strategies == null || strategies.isEmpty()) {
            this.strategyMap = Collections.emptyMap();
        } else {
            this.strategyMap = strategies.stream()
                    .collect(Collectors.toMap(
                            s -> s.getPromotionCode().trim().toUpperCase(),
                            Function.identity(),
                            (existing, replacement) -> existing
                    ));
        }
    }

    /**
     * Resolves the matching discount strategy by promo code (case-insensitive).
     */
    public Optional<DiscountStrategy> findStrategy(String promoCode) {
        if (promoCode == null || promoCode.trim().isEmpty()) {
            return Optional.empty();
        }
        return Optional.ofNullable(strategyMap.get(promoCode.trim().toUpperCase()));
    }
}
