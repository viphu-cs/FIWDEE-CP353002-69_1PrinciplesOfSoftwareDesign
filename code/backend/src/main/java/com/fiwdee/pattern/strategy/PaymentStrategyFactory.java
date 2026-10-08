package com.fiwdee.pattern.strategy;

import com.fiwdee.domain.enums.PaymentMethod;
import com.fiwdee.exception.ValidationException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Factory and registry for PaymentStrategy implementations.
 * Resolves the appropriate strategy instance according to the chosen PaymentMethod.
 */
@Component
public class PaymentStrategyFactory {

    private final Map<PaymentMethod, PaymentStrategy> strategyMap;

    public PaymentStrategyFactory(List<PaymentStrategy> strategies) {
        if (strategies == null || strategies.isEmpty()) {
            this.strategyMap = Collections.emptyMap();
        } else {
            this.strategyMap = strategies.stream()
                    .collect(Collectors.toMap(
                            PaymentStrategy::getSupportedMethod,
                            Function.identity(),
                            (existing, replacement) -> existing
                    ));
        }
    }

    /**
     * Retrieves the PaymentStrategy for the specified PaymentMethod.
     */
    public PaymentStrategy getStrategy(PaymentMethod method) {
        if (method == null) {
            throw new ValidationException("Payment method cannot be null");
        }
        PaymentStrategy strategy = strategyMap.get(method);
        if (strategy == null) {
            throw new ValidationException("Unsupported payment method: " + method);
        }
        return strategy;
    }
}
