package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.SubscriptionType;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.InternalServerErrorException;
import com.sadi.pinklifeline.externals.sslcommerz.SslcommerzClientService;
import com.sadi.pinklifeline.models.entities.BalanceHistory;
import com.sadi.pinklifeline.models.entities.Subscription;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.InitiatePaymentReq;
import com.sadi.pinklifeline.repositories.BalanceHistoryRepository;
import com.sadi.pinklifeline.repositories.SubscriptionRepository;
import com.sadi.pinklifeline.utils.SecurityUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class SubscriptionService extends AbstractPaymentService{

    private final SubscriptionRepository subscriptionRepository;
    private final BalanceHistoryRepository balanceHistoryRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, SslcommerzClientService clientService,
                               BalanceHistoryRepository balanceHistoryRepository) {
        super(clientService);
        this.subscriptionRepository = subscriptionRepository;
        this.balanceHistoryRepository = balanceHistoryRepository;
    }

    @Override
    public void updatePaymentStatus(Long id) {
        Subscription subscription = subscriptionRepository.findById(id).orElseThrow(
                () -> new InternalServerErrorException("Something went wrong during setup, please contact our helpline immediately")
        );
        subscription.setExpiryDate(LocalDateTime.now().plusMonths(
                subscription.getSubscriptionType().getTimeInMonths()
        ));
        subscriptionRepository.save(subscription);
    }

    @Override
    public void setup(Long id, InitiatePaymentReq req) {
        if(req.getSubscriptionType() == null){
            throw new BadRequestFromUserException("Invalid subscription type");
        }
        Subscription subscription = subscriptionRepository.findById(id).orElseGet(
                () -> new Subscription(id));

        subscription.setSubscriptionType(req.getSubscriptionType());
        subscriptionRepository.save(subscription);
    }

    @Override
    public Integer getTotalAmount(Long id) {
        return 0;
    }

    @Override
    public Integer getTotalAmount(Long id, InitiatePaymentReq req) {
        return getSubscriptionPrice(req.getSubscriptionType());
    }

    public static int getSubscriptionPrice(SubscriptionType type) {
        return type.getPrice();
    }

    @Override
    public void validateResourceForPayment(Long id) {
        Long userId = SecurityUtils.getOwnerID();
        if(!id.equals(userId)){
            throw new BadRequestFromUserException("User can only pay for his subscriptions");
        }

        Optional<Subscription> subscription = subscriptionRepository.findById(id);
        if(subscription.isEmpty()) {
            return;
        }

        Subscription sub = subscription.get();
        if(sub.getExpiryDate() != null && sub.getExpiryDate().isAfter(LocalDateTime.now())){
            throw new BadRequestFromUserException(
                    String.format("A current subscription of %s is running. You can subscribe again after it expires",
                            sub.getSubscriptionType())
            );
        }
    }

    @Override
    public void addBalanceToUsers(Long resourceId) {
        Subscription subscription = subscriptionRepository.findById(resourceId).orElseThrow(
                () -> new InternalServerErrorException("Something went wrong during setup, please contact our helpline immediately")
        );

        int adminFees = getSubscriptionPrice(subscription.getSubscriptionType());
        BalanceHistory adminBalance = new BalanceHistory(new User(1L),
                String.format("Payment of %d received for subscription with type %s", adminFees, subscription.getSubscriptionType()),
                adminFees
        );
        balanceHistoryRepository.save(adminBalance);
    }

    public void validateUserForFreeTrial() {
        Long userId = SecurityUtils.getOwnerID();
        Optional<Subscription> subscription = subscriptionRepository.findById(userId);
        if(subscription.isEmpty()) {
            return;
        }

        Subscription sub = subscription.get();
        if(sub.getExpiryDate() != null && sub.getExpiryDate().isAfter(LocalDateTime.now())){
            throw new BadRequestFromUserException(
                    String.format("A current subscription of %s is running. You can subscribe again after it expires",
                            sub.getSubscriptionType())
            );
        }

        if(sub.getUsedFreeTrial())
            throw new BadRequestFromUserException(
                    String.format("User with id:%d has already used his free trial", userId)
            );
    }

    public void setUpFreeTrial() {
        Subscription sub = new Subscription();
        sub.setUserId(SecurityUtils.getOwnerID());

        SubscriptionType type;
        if(SecurityUtils.hasRole("ROLE_DOCTOR"))
            type = SubscriptionType.DOCTOR_FREE_TRIAL;
        else
            type = SubscriptionType.USER_FREE_TRIAL;

        sub.setUsedFreeTrial(true);
        sub.setSubscriptionType(type);
        sub.setExpiryDate(LocalDateTime.now().plusMonths(type.getTimeInMonths()));
        subscriptionRepository.save(sub);
    }
}
