package pe.gob.onpe.sceorcbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;
import org.springframework.kafka.requestreply.ReplyingKafkaTemplate;


@Configuration
public class KafkaConfig {

	@Value("${spring.kafka.consumer.group-id}")
	private String groupId;

	@Value("${kafka.topic.response}")
	private String replyTransmisionTopic;
	
	@Value("${kafka.topic.response-cargo}")
	private String replyCargoTopic;
	

	@Bean(name = "replyingKafkaTemplateTransmision")
	public ReplyingKafkaTemplate<String, String, String> replyingKafkaTemplateTransmision(ProducerFactory<String, String> pf,
	       ConcurrentKafkaListenerContainerFactory<String, String> factory) {
		ConcurrentMessageListenerContainer<String, String> replyContainer = factory.createContainer(replyTransmisionTopic);
		replyContainer.getContainerProperties().setMissingTopicsFatal(false);
		replyContainer.getContainerProperties().setGroupId(groupId);
		ReplyingKafkaTemplate<String, String, String> replyingKafkaTemplate = new ReplyingKafkaTemplate<>(pf, replyContainer);
		return replyingKafkaTemplate;
	}
	
	@Bean(name = "replyingKafkaTemplateCargo")
	public ReplyingKafkaTemplate<String, String, String> replyingKafkaTemplateCargo(ProducerFactory<String, String> pf,
	       ConcurrentKafkaListenerContainerFactory<String, String> factory) {
	   ConcurrentMessageListenerContainer<String, String> replyContainer = factory.createContainer(replyCargoTopic);
	   replyContainer.getContainerProperties().setMissingTopicsFatal(false);
	   replyContainer.getContainerProperties().setGroupId(groupId);
	   ReplyingKafkaTemplate<String, String, String> 
	   replyingKafkaTemplate = new ReplyingKafkaTemplate<>(pf, replyContainer);
	   return replyingKafkaTemplate;
	}
	
}
